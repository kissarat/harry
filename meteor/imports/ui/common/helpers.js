export function idToTimeString(id) {
  id = id / (1000 * 1000)
  const delta = Date.now() - id
  if (delta < 48 * 3600 * 1000) {
    return moment(id).fromNow()
  }
  else if (delta < 30 * 3600 * 1000) {
    return moment(id).format('D/M HH:mm')
  }
  else {
    return moment(id).format('M/D/YY')
  }
}

export function bucketFile(id) {
  return `https://${Meteor.settings.public.aws.endpoint}/${Meteor.settings.public.aws.params.Bucket}/${id}`
}

export function thumb(id) {
  return `/thumb/${id}.jpg`
}

export function requestUpload(file) {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', _.sample(Meteor.settings.public.upload.servers) + '/' + file.name)
  xhr.setRequestHeader('authorization', 'Token ' + localStorage.getItem('Meteor.loginToken'))
  xhr.setRequestHeader('content-type', file.type)
  if (file.lastModifiedDate instanceof Date) {
    xhr.setRequestHeader('last-modified', file.lastModifiedDate.toGMTString())
  }
  setTimeout(() => xhr.send(file), 0)
  return xhr
}

export function upload(file) {
  return new Promise(function (resolve, reject) {
    const xhr = requestUpload(file)
    xhr.addEventListener('error', reject)
    xhr.addEventListener('load', function () {
      resolve(JSON.parse(xhr.responseText))
    })
  })
}

export function timeId() {
  const m = 1000 * 1000
  return Date.now() * m + Math.round(Math.random() * m)
}

export function sequentialUpload(files, events) {
  function upload() {
    const file = files.shift()
    if (file) {
      file.id = timeId()
      const ajax = requestUpload(file)
      _.each(events, function (fn, name) {
        ajax.addEventListener(name, function (e) {
          fn.call(this, e, file)
        })
      })
      ajax.addEventListener('load', upload)
    }
    else if (events.done instanceof Function) {
      events.done()
    }
  }

  upload()
}

export function tag3name(file) {
  if (file) {
    if (file.data) {
      const m = file.data.metadata
      if (m && m.artist && m.title) {
        return m.artist + ' - ' + m.title
      }
      else if (m && m.artist) {
        return m.artist + ' - ' + file.name
      }
      else {
        return file.name || ''
      }
    }
    else {
      return file.name || ''
    }
  }
  console.error('File is undefined')
  return ''
}

export function pageTitle(name) {
  name = 'string' === typeof name ? name.trim().replace(/\s+/g, ' ') : false
  if (name) {
    document.title = name + ' - Evart Social Network'
  }
  else {
    document.title = 'Evart Social Network'
  }
}
