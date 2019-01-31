import alias from 'rollup-plugin-alias'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import svgr from '@svgr/rollup'

import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    postcss({}),
    url(),
    svgr(),
    alias({
      resolve: ['.jsx', 'js', '/index.js'],
      Actions: `${__dirname}/src/actions`,
      Components: `${__dirname}/src/components`,
      Constants: `${__dirname}/src/constants`,
      Pages: `${__dirname}/src/pages`,
      Reducers: `${__dirname}/src/reducers`,
      Sagas: `${__dirname}/src/sagas`,
      Selectors: `${__dirname}/src/selectors`,
      Settings: `${__dirname}/src/settings`,
      Utils: `${__dirname}/src/utils`
    }),
    babel({
      exclude: 'node_modules/**',
      plugins: [ 'external-helpers' ]
    }),
    resolve(),
    commonjs()
  ]
}
