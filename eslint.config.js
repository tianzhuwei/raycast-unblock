// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      // eslint ignore globs here
      'packages/raycast/raycast-env.d.ts',
    ],
  },
  {
    rules: {
      // overrides
    },
  },
)
