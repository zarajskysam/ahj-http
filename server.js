const http = require('http');

const server = http.createServer((req, res) => {
  console.log(req);
  res.end('server response');
});

const port = 7070;

server.listen(port, (err) => {
  if (err) {
    console.log('Error occured:', error);
    return;
  }
  console.log(`server listen on ${port}`);
});
