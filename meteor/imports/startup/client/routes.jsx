import React, {Component} from 'react'
import {AudioPlaylist} from '/imports/ui/audio'
import {Blog, News} from '/imports/ui/blog/article'
import {Edit, ChangePassword, ResetPassword, ResetPasswordPhone} from '/imports/ui/blog/edit'
import {Chat} from '/imports/ui/chat'
import {FileRoute} from '/imports/ui/file'
import {Gallery, Visual} from '/imports/ui/visual'
import {InviteList, FriendList, GroupsList, SubscriberList, User, UserList} from '/imports/ui/list'
import {LoginPage} from '/imports/ui/auth/login'
import {Messenger} from '/imports/ui/message'
import {Phone} from '/imports/ui/rtc/phone'
import {Route, IndexRoute} from 'react-router'
import {Signup} from '/imports/ui/auth/signup'
import {VideoList} from '/imports/ui/video'
import {NotFound} from '/imports/ui/pages'
import {App, BrowserFeatures, NoIndex, Root, Unavailable, rootRedirect}
from '/imports/startup/client/base'

export const RootRoute = <Route path='/' component={Root}>
    <IndexRoute component={rootRedirect}/>
    <Route component={App}>
      <Route path="messenger" component={Messenger}/>
      <Route path="news" component={News}/>
      <Route path="dialog/:peer" component={Messenger}/>
      <Route path="profile" component={Blog}/>
      <Route path="blog/:id" component={Blog}/>
      <Route path="invites" component={InviteList}/>
      <Route path="gallery/:id" component={Gallery}/>
      <Route path="image/:id" component={Visual}/>
      <Route path="video/:id" component={Visual}/>
      <Route path="blog/:id/video" component={VideoList}/>
      <Route path="blog/:id/audio" component={AudioPlaylist}/>
      <Route path="settings" component={Edit}/>
      <Route path="edit/:id" component={Edit}/>
      <Route path="change-password" component={ChangePassword}/>
      <Route path="friends/:id" component={FriendList}/>
      <Route path="friends" component={FriendList}/>
      <Route path="important" component={FriendList}/>
      <Route path="groups" component={GroupsList}/>
      <Route path="subscribers" component={SubscriberList}/>
      <Route path="subscribers/:id" component={SubscriberList}/>
      <Route path="groups/:id" component={GroupsList}/>
      <Route path="unavailable" component={Unavailable}/>
      <Route path="chat/:id/edit" component={Chat}/>
      <Route path="users" component={UserList}/>
      <Route path="phone/:id" component={Phone}/>
      {FileRoute}
    </Route>
    <Route component={NoIndex}>
      <Route path="login" component={LoginPage}/>
      <Route path="signup" component={Signup}/>
      <Route path="signup/verify" component={Signup}/>
      <Route path="signup/about" component={Signup}/>
      <Route path="reset-password/phone" component={ResetPasswordPhone}/>
      <Route path="reset-password/:sid" component={ResetPassword}/>
      <Route path="agent" component={BrowserFeatures}/>
      <Route path="agent/:id" component={BrowserFeatures}/>
      <Route path="*" component={NotFound}/>
    </Route>
  </Route>
