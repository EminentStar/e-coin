const request = require('request');
const config = require('../config');

request.get('http://localhost:3000/api/banks', {
  auth: {
    bearer: config.BANK_TOKEN,
  },
}, (err, res, bodyString) => {
    let body;
  try {
    body = JSON.parse(bodyString);
  } catch (e) {
    console.log('은행 계좌가 확인되지 않습니다.');
    return;
  }

  console.log('request to /banks');
  console.log(body.message);
});

// module.exports = {
//   changeUra () {
    
//   },
// }