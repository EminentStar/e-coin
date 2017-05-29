const request = require('request');
const config = require('../config');

const req = {
  auth: {
    bearer: config.BANK_TOKEN,
  },
};

request.get('http://localhost:3000/api/banks', req , (err, res, bodyString) => {
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

module.exports = {
  chargeUra({ uras, userId }) {
    return new Promise((resolve, reject) => {
      request.get(`http://localhost:3000/api/uras?current=${uras}`, req, (err, res, bodyString) => {
        let body;
        try {
          body = JSON.parse(bodyString);
        } catch (e) {
          console.log('은행 계좌가 확인되지 않습니다.');
          return;
        }

        if (!body || body.length == 0) return reject({ message: '은행에 우라늄이 부족합니다.' });
        const ura = body[0];

        request.put(`http://localhost:3000/api/uras/${ura.id}`, req, (err, res, bodyString) => {
          let body;
          try {
            body = JSON.parse(bodyString);
          } catch (e) {
            console.log('은행 계좌가 확인되지 않습니다.');
            return;
          }

          console.log('here is after put ura');
          console.log(body);

          if (res.statusCode != 200) reject(body);
          else resolve(body);
        }).form({
          to: userId,
        });
      });
    });
  },
}