const child_process = require('child_process');
const { spawn } = require('child_process');
const options = require('./config/index')


options.forEach(item => {
  const { exeName, domName, target, exeName2 } = item
  document.querySelector(`#${domName}`).addEventListener('click', () => {
    spawn(exeName, [target])
    if(exeName2) child_process.exec(`start cmd.exe /K cd /D ${target}`);
  })
})