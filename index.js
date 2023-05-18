const http = require('http');

(async (event, context) => {
    http.get('http://pwaland.brandonxiang.top/api/get-list', ()=> {
      console.log('cron success: ' + Date.now())
    })
    return event
})();