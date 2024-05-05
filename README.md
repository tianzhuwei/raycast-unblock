# Raycast Unblock

<img align="right" src="./.github/icon.png" height="150">

[![Version][package-version-src]][package-version-href]
[![License][license-src]][license-href]

> **Raycast Unblock is currently in heavy development**, with frequent code updates, and you need to keep up with the latest developments in this project.

Unblock all features in Raycast Pro Plan.

> [!WARNING]
> This project is for educational purposes only.
> Please do not use it for commercial purposes.

## Disclaimer

We only borrowed the **operation interface** of Raycast, and **did not modify the backend server** of Raycast.

We just coded a proxy server to forward Raycast's requests to our proxy server, and **implemented similar functions** in Raycast Pro Plan **in other ways**.

## Getting Started

Please follow the documentation at [wibus-wee.github.io/raycast-unblock](https://wibus-wee.github.io/raycast-unblock/)!

## Repo Structure

It's a monorepo managed by [pnpm](https://pnpm.io/).

- [core](./packages/core/) - The Raycast Unblock program.
- [docs](./packages/docs/) - The documentation.
- [raycast](./packages/raycast/) - The Raycast extension.
- [shared](./packages/shared/) - Shared code between packages.

## Related Projects

Here are some similar projects to this one, welcome to check:

- [ourongxing/fake-raycast-backend](https://github.com/ourongxing/fake-raycast-backend) - A fake Raycast backend that can be deployed to Vercel in just one step. *(Based on this project)*
- [zhuozhiyongde/Unlocking-Raycast-With-Surge](https://github.com/zhuozhiyongde/Unlocking-Raycast-With-Surge) - Utilize Surge's MiTM capability to intercept requests and leverage Docker services to emulate backend operations, enabling the activation of Raycast.
- [yufeikang/raycast_api_proxy](https://github.com/yufeikang/raycast_api_proxy) - This is a simple Raycast AI API proxy.

## Star History

<a href="https://star-history.com/#wibus-wee/raycast-unblock&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=wibus-wee/raycast-unblock&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=wibus-wee/raycast-unblock&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=wibus-wee/raycast-unblock&type=Date" />
 </picture>
</a>

## Author

raycast-unblock © Wibus, Released under MIT. Created on Feb 2, 2024

> [Personal Website](http://wibus.ren/) · [Blog](https://blog.wibus.ren/) · GitHub [@wibus-wee](https://github.com/wibus-wee/) · Telegram [@wibus✪](https://t.me/wibus_wee)

<!-- Badges -->

[package-version-src]: https://img.shields.io/github/package-json/v/wibus-wee/raycast-unblock?style=flat&colorA=080f12&colorB=1fa669
[package-version-href]: https://github.com/wibus-wee/raycast-unblock
[license-src]: https://img.shields.io/github/license/wibus-wee/raycast-unblock.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/wibus-wee/raycast-unblock/blob/main/LICENSE
