import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'

export default {
  input: 'main.jsx',
  output: {
    file: 'dist/assets/bundle.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'import.meta.env.VITE_VOICEFLOW_ID': JSON.stringify(''),
      'import.meta.env.VITE_AIRTABLE_PAT': JSON.stringify(''),
      'import.meta.env.VITE_AIRTABLE_BASE': JSON.stringify(''),
      'import.meta.env.VITE_AIRTABLE_TABLE': JSON.stringify(''),
      preventAssignment: true
    }),
    resolve({ extensions: ['.js', '.jsx'] }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]],
      extensions: ['.js', '.jsx']
    })
  ]
}
