var axios = require('axios');

var config = {
  method: 'get',
  url: 'https://lxhentai.com/truyen/me-ke-va-nhung-nguoi-ban',
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
