import React, { Component } from 'react'
import styles from './style.css'
import { getUserPIN, getPhrase } from '../../../db'

import MnemonicView from '../../Shared/Mnemonic'
import ActionButton from '../../Shared/ActionButton'

import { CircularProgress } from 'material-ui/Progress'
import Snackbar from 'material-ui/Snackbar'
import Button from 'material-ui/Button'

import { Form, FormGroup, Label, Input } from 'reactstrap'

class ViewMnemonic extends Component {

  constructor (props) {
    super()
    this.state = {
      pinValue: '',
      retrieve: false,
      alertOpen: false,
      alertMessage: '',
      title: 'Please enter your PIN to view your mnemonic phrase.',
      phrase: [],
      viewPhrase: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  render() {
    return (
      <div id={styles.formContainer}>
        <h6 style={{width: '28rem'}}>
          { this.state.title }
        </h6>
        { this.renderContent() }
        { this.renderAlertView() }
      </div>
    )
  }

  renderContent () {
    const mnemonicView = ( <MnemonicView phrase={ this.state.phrase } /> )

    const btnTitle = {
      default: 'View Mnemonic Phrase',
      processing: 'Retrieving Mnemonic Phrase'
    }

    const pinView = (
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <Input type='password' placeholder='Your PIN' maxLength='4'
            id='pinValue' name='pinValue' value={this.state.pinValue} onChange={this.handleChange} required />
        </FormGroup>
        <ActionButton processing={ this.state.retrieve } title={ btnTitle } isForm={ true } />
      </Form>
    )

    if (this.state.viewPhrase) {
      return mnemonicView
    } else {
      return pinView
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    //Save the new PIN in DB and provide confirmation
    const resetPINValues = {
      pinValue: this.state.pinValue
    }

    console.log(`Reset PIN Values: ${JSON.stringify(resetPINValues)}`)
    this.setState({
      retrieve: true
    })
    this.checkPIN()
  }

  handleChange(event) {
    const target = event.target
    const name = target.name
    var value = target.value
    value = value.replace(/[^0-9]/g,'')
    this.setState({
      [name]: value
    })
  }

  async checkPIN() {
    const { pin } = await getUserPIN()
    console.log(`PIN Saved in DB: ${pin}`)
    if (pin === this.state.pinValue) {
      //TODO: Retrieve Menmonic Phrase
      const phrase = await getPhrase(this.state.pinValue)
      const mnemonicArray = phrase.phrase.split(' ')
      this.timer = setTimeout(() => {
        this.setState({
          title: 'Your mnemonic phrase will be displayed for 3 minutes',
          phrase: mnemonicArray,
          viewPhrase: true,
          retrieve: false,
          pinValue: ''
        })
      }, 1500)

      //After 3 minutes hide the mnemonic
      setTimeout(() => {
        this.setState({
          title: 'Please enter your PIN to view your mnemonic phrase.',
          phrase: '',
          viewPhrase: false,
        })
      }, 180000)

    } else {
      this.handleAlertOpen('Invalid PIN.')
      this.setState({
        retrieve: false
      })
    }
  }

  renderAlertView() {
    return (
      <div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.alertOpen}
          autoHideDuration={6000}
          onClose={this.handleAlertClose}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.alertMessage}</span>}
          action={[
            <Button key="close" color="secondary" size="small"
              onClick={this.handleAlertClose}>
              CLOSE
            </Button>
          ]}
        />
      </div>
    )
  }

  handleAlertOpen (message) {
    this.setState({
      alertOpen: true,
      alertMessage: message
    })
  }

  handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({
      alertOpen: false
    })
  }
}

export default ViewMnemonic