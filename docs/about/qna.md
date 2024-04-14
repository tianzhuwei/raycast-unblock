# Q&A

## I don't want to install Node.js, how can I use it?

- You can use the `app` type dist, which is a single application, and does **not require** JS Runtime. Or use Docker to run it.
- You can use Docker / Docker Compose

## I don't buy Surge, how can I use it?

- Referring to the relevant code of [activation-script](https://github.com/wibus-wee/activation-script/blob/main/src/modules/index.ts#L70-L89) and porting it to other agent tools to continue using MiTM to hijack.
- Or you can use Rewrite Header to implement this function, but you need to make sure Raycast Unblock requests will not be processed by Rewrite Header, otherwise it will cause a dead loop

You can also use the Hosts file to forward Raycast requests to the backend service of Raycast Unblock.
