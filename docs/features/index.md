# General

Here are some system configurations, you can configure some system parameters here, such as the port to listen on, the address to listen on, logs, etc.

## Configuration

The configuration includes the following parameters:

- `mode`: The mode of the service. You can set it to `local` or `remote`. If you deploy this service on a remote server, it is recommended to set mode to `remote`. <Badge type="info" text="Optional" />
- `port`: The port to listen on. <Badge type="info" text="Optional" />
- `host`: The address to listen on. <Badge type="info" text="Optional" />
- `debug`: If there are some problems, you can set debug to true. <Badge type="info" text="Optional" />
- `logger`: If you want to use Fastify Logger, you can set logger to true. <Badge type="info" text="Optional" />
- `watch`: If you want the service to listen to the changes of the configuration file and update automatically, you can set watch to true. <Badge type="info" text="Optional" />
- `Https`: The configuration for HTTPS. <Badge type="info" text="Optional" />
  - `enabled`: Enable HTTPS. <Badge type="info" text="Optional" />
  - `host`: The host to the certificate file (in auto generate mode). <Badge type="info" text="Optional" />
  - `key`: The path to the key file. <Badge type="info" text="Optional" />
  - `cert`: The path to the certificate file. <Badge type="info" text="Optional" />
  - `ca`: The path to the CA file. <Badge type="info" text="Optional" />

::: tip
When `Https.key`, `Https.cert`, `Https.ca` are configured, a custom certificate will be used, and the configuration of `Https.host` will be ignored, and the certificate will not be generated automatically.

Please refer to the [Generate Self-signed Certificate to use with Raycast Unblock - Intercept Raycast](../guide/intercept-raycast#generate-self-signed-certificate-to-use-with-raycast-unblock) guide for more information.
:::

### Example

```toml
[General]
# mode = "local"
# port = 3000
# host = "0.0.0.0"
# debug = false
# logger = false
# watch = false

[General.Https]
# enabled = true
# host = '192.168.3.2'
# key = "path
# cert = "path"
# ca = "path"
```
