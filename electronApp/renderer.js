const spawn = require('child_process').spawn;
const os = require('os')
const options =require('./config/index')
let codeExe = ''


options.forEach(item => {
  const { exeName, domName, target } = item
  document.getElementById(domName).addEventListener('click', () => {
    spawn(exeName, [target])
  })
})