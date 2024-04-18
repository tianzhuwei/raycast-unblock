# Intercept Raycast

We need to intercept Raycast requests and route them through Raycast Unblock to unlock Pro features.

## Universal Solution

You can use Rewrite Header to rewrite Raycast's request to Raycast Unblock. This is a universal solution. Rewrite Header is a function that most proxy software have. However, it's important to note that:

::: danger
Raycast Unblock's request **_cannot be processed_** by Rewrite Header, or it will cause an infinite loop.
:::

For example, in Surge, you can add content like the following to your configuration file:

```txt
[URL Rewrite]
https:\/\/backend.raycast.com http://192.168.x.x:3000 header
```

## Use it with mitmproxy

[mitmproxy](https://mitmproxy.org/) is a free and open source interactive HTTPS proxy. We can use it to intercept Raycast's requests and route them through Raycast Unblock to unlock Pro features.

1. Install mitmproxy and the mitmproxy CA certificate.
2. Write Python code to intercept:

```python
# mitm.py
from mitmproxy import http

def request(flow: http.HTTPFlow) -> None:
  if flow.request.headers.get('x-raycast-unblock') == 'true':
    return
  if 'backend.raycast.com' in flow.request.pretty_url:
    print(f"request: {flow.request.pretty_url}")
    new_url = flow.request.pretty_url.replace('https://backend.raycast.com', 'http://127.0.0.1:3000')
    flow.request.url = new_url
```

3. Run mitmproxy: `mitmproxy -s mitm.py`.
4. Open Raycast and use the features in the Pro Plan.

## Use it with Surge Scripts (Not recommend)

> [!NOTE]
> In some cases, if you find that Raycast Unblock is not working properly, please go to the settings of Surge, and uncheck the last line `*` in `Surge -> HTTP -> Capture(捕获) -> Capture MITM Overrides(捕获 MITM 覆写)`, which is `Modify MITM Hostname`.

1. Go to [wibus-wee/activation-script](https://github.com/wibus-wee/activation-script) and follow the installation instructions.
2. Run Raycast Unblock and Surge.
3. Open Raycast and use the features in the Pro Plan.

> [!tip]
> Currently, `activation-script` will not forward the requests of `Translate` and `me` to Raycast Unblock by default. Instead, it will immediately forward the requests to DeepL or handle them itself in the script. You need to modify the code manually. Please refer to the documentation of activation-script for details.

## If you don't have Surge

You need to throw all Raycast requests to the backend built by this project, but make sure that the backend **can request Raycast Backend normally**, because some functions need to request Raycast Backend once and then do it.

1. You can use Rewrite Header to implement this function - [Universal Solution](#universal-solution).

2. You can refer to the code in [wibus-wee/activation-script](https://github.com/wibus-wee/activation-script) and port it to other agent tools to continue using MiTM to hijack.

3. You can edit the `/etc/hosts` file to implement interception, but this method only supports Raycast Unblock deployments in remote locations. - [Hosts](#hosts)

::: warning

If you are building the backend locally, please do not let your proxy tool proxy both Raycast's requests and the backend service's requests, as this will cause it to not work properly.

Or you can deploy the backend to a remote server, and this will not be a problem.
:::

### More

Raycast Unblock adds an `x-raycast-unblock` header to requests to Raycast Backend.

You can determine whether this is a request from Raycast or Raycast Unblock by the presence of this header, and make the backend service work properly through conditional judgment. (Raycast Unblock has turned off SSL check by default)

[Related Code in activation-script](https://github.com/wibus-wee/activation-script/blob/main/src/modules/index.ts#L70-L89)

## Hosts

::: danger
This method can only be used when the backend is deployed **remotely**, and cannot be used when the backend is deployed locally.

- `Local` in this context refers to running both Raycast Unblock and Raycast simultaneously on the same computer.

:::

For users who use remote deployment, we recommend using `reverse proxy` to make Raycast Unblock service can be accessed normally.

This method requires you to **deploy SSL certificate** remotely, otherwise it will be invalid.

At the same time, `general.host` needs to be configured as `0.0.0.0` in the `config.toml` file.

You can modify your hosts file to make Raycast requests go to the backend built by this project.

```txt
<Your Backend IP> backend.raycast.com
```

### Generate Self-signed Certificate to use with Raycast Unblock

This section is written for those who want to use Raycast Unblock by specifying hosts. This may be useful for users deploying on NAS or other local machines.

::: warning
This is an advanced operation and it may require *some technical skills*. It is only suitable for production deployment in a remote server.
:::

1. Open your config file, set `enabled` to `true` in `[General.Https]`, fill in your host's local IP in `host`, and leave others as default. Then set `port` as `443` in `[General]`.

2. Then start Raycast Unblock, it will automatically setup HTTPS for the service and install the CA certificate.

3. Go to the CA Root certificate storage *(it will be shown in Raycast Unblock's log)*.

4. Export two files in it ( `rootCA-key.pem`, `rootCA.pem` ), and save these two files to `/Users/<YOUR USERNAME>/Library/Application Support/mkcert` (create it if not exists) in the computer that runs Raycast.

5. Go to [FiloSottile/mkcert Release](https://github.com/FiloSottile/mkcert/releases/tag/v1.4.4), download and use the executable file that matches your Raycast computer's architecture, and rename it to `mkcert`.

6. Then run the following command after replacing the placeholders in the command:

```shell
./mkcert -install
```

When it shows `The local CA is now installed in the system trust store! ⚡️`, it means the installation is successful. You can use Raycast Unblock by specifying hosts now!
