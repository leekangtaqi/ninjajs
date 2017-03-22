const Koa = require('koa');
const fs = require('fs');
const serve = require('koa-static');
const send = require('koa-send')
const sendfile = require('koa-sendfile')
const path = require('path')
const app = new Koa();

app.use(serve(path.join(__dirname, '../dist')));

app.use(async (ctx, next) => {
  await sendfile(ctx, path.join(__dirname, './index.html'));
})
 
app.listen(3000);