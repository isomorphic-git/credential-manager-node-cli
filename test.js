const credentialManager = require('./index.js')

const stuff = { protocol: 'http', host: 'github.com' }
credentialManager.fill(stuff).then(async auth => {
  console.log(auth)
  await credentialManager.approved({...stuff, auth})
  await credentialManager.rejected({...stuff, auth})
})
