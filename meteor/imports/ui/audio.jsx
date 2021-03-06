import React, {Component} from 'react'
import {Subscriber, Search, ScrollArea} from './common/widget'
import Dropzone from 'react-dropzone'
import {sequentialUpload, bucketFile, tag3name} from './common/helpers'
import _ from 'underscore'
import {Busy, EllipsisMenu} from './common/widget'

class Audio extends Component {
  render() {
    const trackName = tag3name(this.props.playing)
    const items = Meteor.userId() == this.props.from ? {remove: 'Remove'} : {add: 'Add'}
    const track = this.props.active
      ? <span className="play"/>
      : <span className="number">{trackName}</span>
    return <li className={this.props.active ? 'active' : ''}>
      <div onClick={this.props.onClick} className="order" data-order="1">{track}</div>
      <div onClick={this.props.onClick} className="title">{tag3name(this.props)}</div>
      <EllipsisMenu items={items} {...this.props}/>
    </li>
  }
}

//
// <div className="ctrl ctrl-volume">
//  <input type="range"/>
/// </div>

class Player extends Component {
  componentWillMount() {
    const audio = document.createElement('audio')
  }

  onTimeUpdate = (e) => {
    this.setState({time: e.target.currentTime})
  }

  onLoadedMetadata = () => {
    const state = {playing: this.props.id}
    Meteor.call('blog.update', {id: Meteor.userId()}, state, () => this.setState(state))
  }

  onSeek = (e) => {
    this.setState({time: +e.target.value})
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  play = () => {
    this.setState({playing: this.refs.audio.paused})
    if (this.refs.audio.paused) {
      this.refs.audio.play()
    }
    else {
      this.refs.audio.pause()
    }
  }

  render() {
    const meta = this.props.data.metadata
    const audio = this.refs.audio
    const controls = this.refs && this.refs.audio ? <div className='media-controls'>
      <div className="ctrl ctrl-play" onClick={this.play}>
        <span className={audio.paused ? 'play' : 'pause'}/>
      </div>
      <div className="ctrl ctrl-progress">
        <input type="range"
               step="1"
               min="0"
               value={audio.currentTime}
               max={audio.duration}
               onChange={this.onSeek}/>
      </div>
      <div className="ctrl ctrl-repeat">
        <span className="repeat"/>
      </div>
    </div> : ''
    return <div className="media-container">
      <audio
        ref="audio"
        src={bucketFile(this.props.id)}
        onTimeUpdate={this.onTimeUpdate}
        onLoadedMetadata={this.onLoadedMetadata}
        onSeeked={this.onSeek}
      />
      <div className="background">
        <div style={{backgroundImage: 'url("/images/video-poster.jpg")'}}/>
      </div>

      <div className="media-poster text-center">
        <div className="title">
          <h3>{meta.title}</h3>
        </div>
        <div className="poster-container">
          <div className="poster" style={{backgroundImage: 'url("/images/video-poster.jpg")'}}></div>
        </div>
      </div>

      <div className="media-overlay">
        <div className="ctrl ctrl-title">
          <h3>{meta.artist}</h3>
          <p>{meta.album}</p>
        </div>
        <div className="ctrl ctrl-favorite">
          <span className="star-five"/>
        </div>
        <div className="ctrl ctrl-more">
          <span>&bull;&bull;&bull;</span>
        </div>
      </div>

      {controls}
    </div>
  }
}

export class AudioPlaylist extends Subscriber {
  componentWillReceiveProps(props) {
    this.subscribe('file', {
      type: 'audio',
      recipient: props.params && isFinite(props.params.id)
        ? this.props.params.id
        : Meteor.userId()
    })
  }

  componentWillMount() {
    this.state = {}
    this.subscribe('convert_progress')
    this.componentWillReceiveProps(this.props)
  }

  onClickAdd = () => {
    this.setState({upload: true})
  }

  onDrop = (files) => {
    sequentialUpload(files, {
      progress: (e, file) => {
        this.setState({
          ['upload_' + file.id]: {
            id: file.id,
            name: file.name,
            loaded: file.loaded,
            total: file.total
          }
        })
      },
      load: (e, file) => {
        this.setState({['upload_' + file.id]: false})
      },
      done: () => this.setState({upload: false})
    })
  }

  search = (string) => {
    this.subscribe('file', {type: 'audio', order: {id: -1}, search: string})
  }

  open = (file) => {
    if (this.props.open instanceof Function) {
      this.props.open(file)
    }
    else {
      this.setState({active: file})
    }
  }

  getUploads() {
    return _.filter(this.state, (v, k) => v && 0 === k.indexOf('upload_'))
  }

  render() {
    const player = this.state.active ? <Player {...this.state.active}/> : ''
    const files = this.getSubscription('file').map(file =>
      <Audio
        {...file}
        key={file.id}
        active={file === this.state.active}
        onClick={() => this.open(file)}
      />
    )
    const uploads = this.getUploads().map(u => <div key={u.id}>
      <span className="song">{u.name}</span>
      <progress value={u.loaded} max={u.total}/>
      <span>{u.loaded / (1024 * 1024)}/{u.total / (1024 * 1024)}</span>
    </div>)
    const converts = this.getSubscription('convert_progress').map(f =>
      <div className="convert-progress song" key={f.id}>
        <span className="action">Processing</span>
        <span>{f.name}</span>
      </div>
    )
    return <div className="player audio">
      {player}
      <div className="playlist-container">
        <Search label="Search music..." search={this.search}>
          <button className="add" onClick={this.onClickAdd}>
            <div className="center">+</div>
          </button>
        </Search>
        <div className="playlist">
          <div className="upload-container">
            {converts}
            {uploads}
          </div>
          <Dropzone className={'uploader' + (this.state.upload ? '' : ' hide')} onDrop={this.onDrop}>
            <div className="upload-zone">
              <div className="dropZone">
                <div className="upload"/>
                <div>Drop audio file here</div>
              </div>
              <button type="button" className="btn upload">Upload</button>
            </div>
            <div className="progressBar-container">
              <div className="progressBar">
                <div className="uploader-content">
                  <div className="prgbar">
                    <div className="progress">
                      <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45"
                           aria-valuemin="0" aria-valuemax="100">
                        <span className="sr-only"></span>
                      </div>
                    </div>
                  </div>
                  <div className="status"></div>
                  <div className="options">
                    <span className="settings"/>
                  </div>
                </div>
              </div>
            </div>
          </Dropzone>
          <ScrollArea>{files}</ScrollArea>
        </div>
      </div>
    </div>
  }
}
