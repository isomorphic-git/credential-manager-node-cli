const pkg = require('./package.json')
const ConfigStore = require('configstore')
const conf = new ConfigStore(pkg.name)
const prompts = require('prompts')

module.exports = {
  async fill ({ url }) {
    let { host } = new URL(url)
    let auth = conf.get(url)
    if (auth && auth.length === 1) {
      let response = await prompts([
        {
            type: 'confirm',
            name: 'use',
            message: `Use saved credentials for ${auth[0].username}?`,
            initial: true,
        }
      ])
      if (response.use) return auth[0]
    }
    if (auth && auth.length > 1) {
      let choices = auth.map(x => ({
        title: x.username,
        value: x
      }))
      choices.push({title: 'New credentials...', value: null})
      let response = await prompts([
        {
            type: 'select',
            name: 'auth',
            message: `Select which credentials to use`,
            choices,
        }
      ])
      if (response.auth) return response.auth
    }
    let response = await prompts([
      {
          type: 'text',
          name: 'username',
          message: `Enter username for ${host}`
      },
      {
          type: 'password',
          name: 'password',
          message: prev => `Enter password for ${prev}`
      }
    ])
    return response
  },

  async approved({ url, auth }) {
    // Is this already saved?
    if (conf.has(url)) {
      if (conf.get(url).some(x => JSON.stringify(x) === JSON.stringify(auth))) return
    }
    let response = await prompts([
      {
        type: 'toggle',
        name: 'save',
        message: 'Do you want to save this password?',
        initial: true,
        active: 'yes',
        inactive: 'no'
      }
    ])
    if (response.save) {
      if (conf.has(url)) {
        let tmp = conf.get(url)
        tmp.push(auth)
        conf.set(url, tmp)
      } else {
        conf.set(url, [auth])
      }
    }
  },

  async rejected({ url, auth }) {
    let val = conf.get(url)
    if (val) {
      let _val = val.filter(x => JSON.stringify(x) !== JSON.stringify(auth))
      if (val.length === _val.length) return
      let response = await prompts([
        {
          type: 'toggle',
          name: 'delete',
          message: `Authentication to ${host} was unsuccessful.\nDo you want to delete this saved password?`,
          initial: true,
          active: 'yes',
          inactive: 'no'
        }
      ])
      if (response.delete) {
        if (_val.length === 0) {
          conf.delete(url)
        } else {
          conf.set(url, _val)
        }
      }
    }
  }
}
