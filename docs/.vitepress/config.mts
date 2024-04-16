import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/raycast-unblock/',
  title: 'Raycast Unblock',
  lastUpdated: true,
  metaChunk: true,
  description: 'Unblock all features in Raycast Pro Plan with implementing similar functions in other ways.',
  head: [
    ['script', {
      src: 'https://openpanel.dev/op.js',
      defer: '',
      async: '',
    }],
    ['script', {}, `window.op =
      window.op ||
      function (...args) {
        (window.op.q = window.op.q || []).push(args);
      };
    window.op('ctor', {
      clientId: 'e6fa1828-537a-4ade-bd7e-e78ef1ff4373',
      trackScreenViews: true,
      trackOutgoingLinks: true,
      trackAttributes: true,
    });
    console.log('openpanel is ok!')
    `],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/what-is-raycast-unblock' },
      // { text: 'Features', link: '/features/' },
      { text: 'About', items: [
        {
          text: 'Q&A',
          link: 'about/qna',
        },
      ] },
    ],

    logo: { src: '/icon.png', width: 24, height: 24 },

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'What is Raycast Unblock?', link: '/guide/what-is-raycast-unblock' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Intercept Raycast', link: '/guide/intercept-raycast' },
        ],
      },
      {
        text: 'Feature - AI',
        items: [
          { text: 'Azure OpenAI', link: '/features/azure-openai' },
          { text: 'Function Call', link: '/features/function-call' },
          { text: 'Groq Web', link: '/features/groq-web' },
        ],
      },
      {
        text: 'Feature - Translator',
        items: [
          { text: 'AI Translator', link: '/features/ai-translator' },
          { text: 'LibreTranslate', link: '/features/libre-translate' },
          { text: 'Shortcut Translator', link: '/features/shortcut-translator' },
        ],
      },
      {
        text: 'Feature - Cloud Sync',
        items: [
          { text: 'iCloud Drive', link: '/features/icloud-drive' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wibus-wee/raycast-unblock' },
    ],

    search: {
      provider: 'local',
    },
  },
})
