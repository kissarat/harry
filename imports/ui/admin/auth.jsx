import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Template} from 'meteor/templating'
import {Blaze} from 'meteor/blaze'
import {Accounts} from 'meteor/accounts-base'

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
})

export class Auth extends Component {
  componentDidMount() {
    this.view = Blaze.render(Template.loginButtons,
      ReactDOM.findDOMNode(this.refs.container))
  }

  componentWillUnmount() {
    Blaze.remove(this.view)
  }

  render() {
    return <span ref="container"/>
  }
}