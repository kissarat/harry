import {query, table, errors, timeId} from './db'
import _ from 'underscore'

Meteor.publish('blog', function (params = {}) {
  return query('blog', params).cursor()
})

Meteor.methods({
  'blog.get' (params) {
    const where = _.pick(params, 'id', 'domain')
    where.recipient = parseInt(Meteor.userId(), 36)
    return table('blog_recipient')
      .where(where)
      .single()
  },

  'blog.create' (params) {
    return table('blog')
      .insert(_.pick(params, 'domain', 'name', 'type'), ['id', 'time'])
      .single()
      .then(function (blog) {
        if (Meteor.userId() === params.domain) {
          Meteor.users.update({_id: Meteor.userId()}, {
            $set: {
              id: blog.id
            }
          })
        }
        return blog
      })
  },

  establish(params) {
    const where = {
      from: parseInt(Meteor.userId(), 36),
      to: +params.id
    }
    const q = table('relation')
    if (['follow', 'manage', 'deny', 'reject'].indexOf(params.relation) >= 0) {
      const changes = {id: timeId(), type: params.relation}
      return q.insert(_.extend(changes, where))
        .promise().catch(function (err) {
          if (errors.UNIQUE_VIOLATION === err.code) {
            return table('relation')
              .where(where)
              .update(changes)
              .promise()
          }
          throw err
        })
    }
    else {
      return q.where(where).del().promise()
    }
  },

  repost(params) {
    params.from = parseInt(Meteor.userId(), 36)
    return table('repost').insert(params).promise()
  }
})
