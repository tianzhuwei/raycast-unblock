# DeepL <Badge type="tip" text="^0.1.0-beta.8" />

You can use DeepL to translate text in Raycast Translate feature.

> This feature is provided by [OwO-Network/DeepLX](https://github.com/OwO-Network/DeepLX) package.

## Usage

1. Set `Translate.default` to `deeplx` in your configuration file.

## Configuration

- `proxy_endpoint`: The proxy endpoint for DeepL API. <Badge type="info" text="Optional" />
- `access_token`: The access token for DeepL API. <Badge type="info" text="Optional" />

## Example

```toml
[Translate.DeepLX]
proxy_endpoint = "<your-proxy-endpoint>"
access_token = "<your-access-token>"
```
