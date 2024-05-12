# OpenAI

Raycast Unblock provides an OpenAI feature. You can use it to generate text using the OpenAI API.

## Usage

1. Set `AI.default` to `openai` in your configuration file.
2. Set `AI.OpenAI.api_key` to your OpenAI API key in your configuration file.
3. *(optional)* Set `AI.OpenAI.default` to the default model you want to use in your configuration file.
4. *(optional)* You can add your custom models to the `AI.OpenAI.Models` in your configuration file.

### Custom Models

You can add your custom models to the `AI.OpenAI.Models` in your configuration file.

The definition of a custom model is like this:

```toml
[AI.OpenAI.Models.model_name]
```

You shouldn't use the dot in the model name. It will be parsed as a section. For example, `GPT-3.5` should be `GPT3_5` or other names without a dot.

Other parameters you can see in the example below.

## Configuration

- `temperature`: The temperature of the model. <Badge type="info" text="Optional" />
- `max_tokens`: The maximum tokens of the model. <Badge type="info" text="Optional" />
- `api_key`: Your OpenAI API key.
- `default`: The default model to use. <Badge type="info" text="Optional" />
- `Models`: The custom models to use. <Badge type="info" text="Optional" />
  - `Models.<model>`: The model name.
    - `base_url`: The base URL of the model. <Badge type="info" text="Optional" /> <Badge type="warning" text="^v0.5.0-beta.2" />
    - `api_key`: The API key of the model. <Badge type="info" text="Optional" /> <Badge type="warning" text="^v0.5.0-beta.2" />
    - `real_id`: The real id of the model. <Badge type="info" text="Optional" /> <Badge type="warning" text="^v0.5.0-beta.2" />
    - `id`: The model id. It should be unique.
    - `model`: The model name.
    - `name`: The model name.
    - `description`: The model description.
    - `speed`: The speed of the model.
    - `intelligence`: The intelligence of the model.
    - `context`: The context of the model.
    - `status`: The status of the model. <Badge type="info" text="Optional" />
    - `capabilities`: The capabilities of the model. <Badge type="info" text="Optional" />
      - `image_generation`: The image generation capability. <Badge type="info" text="Optional" />
      - `web_search`: The web search capability. <Badge type="info" text="Optional" />

::: tip TIPS: When to use the `base_url` parameter?

You can use the `base_url` parameter when you want to use a different base URL for the model. For example, you can use it to use a different endpoint for the model.

Also, `api_key` and `real_id` parameters are used for the same purpose. You can use them when you want to use a different API key or real id for the model.

`real_id` is the real id of the model. It's used to request the model from the api. If you don't provide it, the `id` parameter will be used as the real id.

::: details Example for `real_id`, `api_key`, and `base_url`

- Model1
  - id: `something-endpoint-gpt-4-0125-preview`
  - real_id: `gpt-4-0125-preview`
  - base_url: `https://something-endpoint.com/v1`
  - Actually, the request will be sent to `https://something-endpoint.com/v1/chat/completions`, and model id will be `gpt-4-0125-preview`.
- Model2
  - id: `another-endpoint-gpt-4-0125-preview`
  - real_id: `gpt-4-0125-preview`
  - base_url: `https://another-endpoint.com/v1`
  - Actually, the request will be sent to `https://another-endpoint.com/v1/chat/completions`, and model id will be `gpt-4-0125-preview`.
:::

:::

### Example

```toml
[AI.OpenAI]
api_key = '<your api key>'
default = ''
# temperature = 0.5
# max_tokens = 100

[AI.OpenAI.Models.GPT4]
id = "gpt-4-0125-preview"
model = "gpt-4-0125-preview"
name = "GPT-4 (Preview)"
description = "GPT-4 is OpenAI’s most capable model with broad general knowledge, allowing it to follow complex instructions and solve difficult problems.\n"
speed = 3
intelligence = 3
context = 8
status = "beta"

[AI.OpenAI.Models.GPT4.Capabilities]
image_generation = true # Not supported yet
web_search = true # The premise is that the model needs to support Function Call.
```
