const spawn = require('child_process').spawn;
const os = require('os')

//股份项目
const gufenBtn = document.getElementById('gufen-menu')
gufenBtn.addEventListener('click', () => {
  spawn('explorer.exe', ['D:\\company\\gufen\\bugFix'])
})

const githubBtn = document.getElementById('github-menu')
githubBtn.addEventListener('click', () => {
  spawn('explorer.exe', ['D:\\github'])
})