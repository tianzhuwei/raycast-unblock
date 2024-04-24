import fs from 'node:fs'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  // FIXME: This is a workaround for the issue:
  // - Inlined implicit external xxx
  failOnWarn: false,
  hooks: {
    'build:done': async () => {
      const file = '../../config.toml'
      if (fs.existsSync(file))
        fs.copyFileSync(file, 'dist/config.toml')
    },
  },
})
