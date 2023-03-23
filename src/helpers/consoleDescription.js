'use strict';
const { green, magenta, yellow } = require('./Colorer.js');

const consoleDescription = () => {
  const title = `
  _________________________________________________________________________
   ______                       ______                                     
  (_____ \\                     / _____)                                    
   _____) )___ ___ _   _ _   _( (____   ____  ____ _____ ____  _____  ____ 
  |  ____/ ___) _ ( \\ / ) | | |\\____ \\ / ___)/ ___|____ |  _ \\| ___ |/ ___)
  | |   | |  | |_| ) X (| |_| |_____) | (___| |   / ___ | |_| | ____| |    
  |_|   |_|   \\___(_/ \\_)\\__  (______/ \\____)_|   \\_____|  __/|_____)_|    
                        (____/                          |_|            
  _________________________________________________________________________
                        `;
  const repo = 'https://github.com/timursevimli/proxy-scraper-checker';
  const author = 'Timur Sevimli';
  const logInfo = 'For log files, see the directory named \'logs\'!';

  console.log(`
  ${magenta(title)}
  ${green('Repo:')} ${repo} ${green('Author:')} ${author}
  ${yellow(logInfo)}
  `);
};

module.exports = consoleDescription;

