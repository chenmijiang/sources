const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const terser = require('terser')
const rollup = require('rollup')
const configs = require('./configs.cjs')
const configTypes = require('./config-types.cjs')

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

build(Object.keys(configs).map((key) => configs[key]))

async function build(builds) {
  for (const entry of builds) {
    try {
      await buildEntry(entry)
    } catch (err) {
      logError(err)
    }
  }

  try {
    await buildTypes()
  } catch (err) {
    logError(err)
  }
}

async function buildEntry(config) {
  const output = config.output
  const { file, banner } = output
  const isProd = /(min|prod)\.(?:c|m)?js$/.test(file)
  const fileName = path.basename(file)

  try {
    let bundle = await rollup.rollup(config)
    let {
      output: [{ code, map }]
    } = await bundle.generate(output)

    if (isProd) {
      const minified = await minify(banner, code + '\n//# sourceMappingURL=' + fileName + '.map')
      write(file, minified, true)
      if (map) {
        write(`${file}.map`, map.toString())
      }
    } else {
      write(file, code + '\n//# sourceMappingURL=' + fileName + '.map')
      if (map) {
        write(`${file}.map`, map.toString())
      }
    }
  } catch (err) {
    throw new Error(err)
  }
}

async function buildTypes() {
  const output = configTypes.output
  const { file } = output

  try {
    let bundle = await rollup.rollup(configTypes)
    let {
      output: [{ code }]
    } = await bundle.generate(output)

    return write(file, code)
  } catch (err) {
    throw new Error(err)
  }
}

async function minify(banner, code) {
  const output = await terser.minify(code, {
    toplevel: true,
    output: {
      ascii_only: true
    },
    compress: {
      pure_funcs: ['makeMap']
    }
  })
  return (banner || '') + output.code
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(
        blue(path.relative(process.cwd(), dest)) +
          ' ' +
          getSize(code) +
          (extra || '')
      )
      resolve()
    }

    fs.writeFile(dest, code, (err) => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(` (gzipped: ${getSize(zipped)})`)
        })
      } else {
        report()
      }
    })
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError(e) {
  console.error(e)
}

function blue(str) {
  return `\x1b[1m\x1b[34m${str}\x1b[39m\x1b[22m`
}
