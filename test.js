const credentialManager = require('./index.js')

credentialManager.fill({url: 'https://github.com/test/test'}).then(async auth => {
  console.log(auth)
  await credentialManager.approved({url: 'https://github.com/test/test', auth})
  await credentialManager.rejected({url: 'https://github.com/test/test', auth})
})
