const config = require('../config')
const MongoClient = require('mongodb').MongoClient
const crypto = require('crypto')
const fs = require('fs')
const AWS = require('aws-sdk')
const stream = require('stream')
const db = require('../meteor/server/db')
const ffprobe = require('node-ffprobe')
const _ = require('underscore')

const s3 = new AWS.S3(config.aws)

try {
  fs.accessSync(config.file.temp, fs.constants.W_OK)
}
catch (ex) {
  if ('ENOENT' === ex.code) {
    fs.mkdirSync(config.file.temp)
  }
  else {
    console.error(ex)
    process.exit(1)
  }
}

function sha256(string) {
  const h = crypto.createHash('sha256')
  h.update(string)
  return h.digest('base64')
}

module.exports = _.extend(require('../meteor/imports/server/common'), {
  authenticate(token) {
    return new Promise(function (resolve, reject) {
      function cb(err, user) {
        if (err) {
          reject(err)
        }
        else {
          resolve(user)
        }
      }

      MongoClient.connect(config.mongo, function (err, db) {
        if (err) {
          reject(err)
        }
        else {
          db.collection('users')
            .findOne({'services.resume.loginTokens': {$elemMatch: {hashedToken: sha256(token)}}}, cb)
        }
      })
    })
  },

  upload(options) {
    return new Promise(function (resolve, reject) {
      s3.createBucket(function () {
        _.defaults(options, {
          CacheControl: 'public'
        })
        if (options.filename) {
          options.Body = fs.createReadStream(options.filename)
          delete options.filename
        }
        s3.upload(options, function (err, data) {
          if (err) {
            reject(err)
          }
          else {
            resolve(data)
          }
        })
      })
    })
  },

  getMIME(name) {
   return db
     .knex('mime')
     .where({id: name})
     .single()
  },

  fileStat(filename) {
    return new Promise(function (resolve, reject) {
      fs.stat(filename, function (err, stat) {
        if (err) {
          reject(err)
        }
        else {
          resolve(stat)
        }
      })
    })
  },

  saveFile(reader, filename) {
    return new Promise(function (resolve, reject) {
      const writer = fs.createWriteStream(filename)
      reader.on('error', reject)
      writer.on('error', reject)
      reader.pipe(writer)
      reader.on('end', resolve)
    })
  },

  probe(filename) {
    return new Promise(function (resolve, reject) {
      ffprobe(filename, function (err, probe) {
        if (err) {
          reject(err)
        }
        else {
          resolve({
            streams: probe.streams.map(function (stream) {
              return _.pick(stream, 'codec_name', 'codec_type', 'bit_rate', 'sample_rate')
            }),
            format: probe.format,
            metadata: probe.metadata
          })
        }
      })
    })
  },

  remove(id) {
    return new Promise(function (resolve, reject) {
      fs.unlink(config.file.temp + '/' + id, function (err, res) {
        if (err) {
          reject(err)
        }
        else {
          resolve(res)
        }
      })
    })
  }
})
