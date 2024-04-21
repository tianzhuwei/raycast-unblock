# Cohere Web <Badge type="tip" text="^0.5.0-beta.0" />

Raycast Unblock offers Cohere Web AI support. You can use Cohere's models for free via their Web API.

::: warning
This is an inverted API. Please use with caution.
:::

::: tip
Due to the special nature of Cohere Web's transmission, this feature may face *many unstable situations*. Please use with caution.
:::

## Usage

Make sure you have an account on [Cohere](https://coral.cohere.com). You can sign up for free.

Modify the configuration file with your Cohere account credentials (email and password).

## Configuration

The configuration for this feature includes the following parameters:

- `email`: Your email address for Cohere.
- `password`: Your password for Cohere.

### Example

```toml
[AI.Cohere]
email = '<your email>'
password = '<your password>'
```
