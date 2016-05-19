const bb            = require('bluebird'),
      child_process = require('child_process'),
      fs            = bb.promisifyAll(require('fs')),
      preptool      = require('rfc-preptool'),
      t2            = require('through2'),
      vfs           = require('vinyl-fs'),
      xmljade       = require('xmljade')

// Start up a separate process for an HTTP server, so that the synchronus
// URL fetching that will be in this process won't deadlock.
// See server.js
class Server {
  constructor(port) {
    this.port = port
    this.worker = null
  }
  start() {
    return new bb((res, rej) => {
      this.worker = child_process.fork('./server',
                                       [this.port.toString()])
      this.worker.on('message', (msg) => {
        switch (msg.name) {
          case 'listen':
            console.log(`Listening on http://${msg.addr.address}:${msg.addr.port}/`)
            res(msg.addr)
            break
          case 'error':
            rej(msg.error)
            break
        }
      })
    })
  }

  stop() {
    if (this.worker) {
      console.log('Stopping server')
      this.worker.send('stop')
      this.worker = null
    }
  }
}

let server = new Server(7749)

function t2p(fnc) {
  return () => {
    return t2.obj((f, enc, cb) => {
      fnc.call(this, f).thenReturn(f).asCallback(cb)
    })
  }
}

log = () => {
  return t2.obj((f, enc, cb) => {
    console.log(`INPUT: ${f.path}`)
    cb(null, f)
  })
}

prep = t2p((f) => {
  var s = new preptool({
    input: f.path,
    data: f.contents
  })
  return s.run()
  .then((data) => f.contents = new Buffer(data))
})

toHtml = t2p((f) => {
  return xmljade.transformFile("v3tohtml.jade", f.contents, {
    pretty: true,
    html: true,
    "dentin-doublequote": true
  })
  .then((data) => {
    f.contents = new Buffer(data)
    f.extname = '.html'
  })
})

const exec = bb.promisify(child_process.exec)
toPDF = t2p((f) => {
  return exec(`prince --attach=out/${f.stem}.xml ${f.path} -o -`, {
    encoding: 'Buffer'
  })
  .then((data) => {
    f.contents = data
    f.extname = '.pdf'
  })
})

// Hopefully, this doesn't happen anymore.
process.on("unhandledRejection", function(reason, promise) {
  if (listener) {
    console.log('UNHANDLED', reason)
    server.stop()
  }
});

// e.g. crash
process.on('exit', () => server.stop())

server.start()
.then(() => {
  return new Promise((res, rej) => {
    vfs.src('*.xml')
    .pipe(log())
    .pipe(prep())
    // write intermediate prep'd XML file, for prince input
    .pipe(vfs.dest('./out'))
    .pipe(toHtml())
    .pipe(vfs.dest('./out'))
    .pipe(toPDF())
    .pipe(vfs.dest('./out'))
    .on('end', res)
    .on('error', rej)
  })
})
.then(_ => {
  console.log('done')
})
.catch(er => {
  console.log("ERROR:", er)
})
.finally(() => server.stop())
