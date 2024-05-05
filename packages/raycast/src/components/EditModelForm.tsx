import { useSnapshot } from 'valtio'
import { Action, ActionPanel, Form, Toast, showToast, useNavigation } from '@raycast/api'
import { FormValidation, useForm } from '@raycast/utils'
import { ofetch } from 'ofetch'
import type { RaycastAIModel } from '@ru/shared'
import { globalState } from '../state/global'
import { MutateState } from '../state/mutate'
import { API_MODEL_UPDATE } from '../constants'
import { build } from '../utils/build'

interface Model extends Omit<RaycastAIModel, 'capabilities' | 'speed' | 'intelligence' | 'context'> {
  capabilities: string[]
  speed: string
  intelligence: string
  context: string
}

export function EditModelForm(props: { model: string }) {
  const navigation = useNavigation()
  const snap = useSnapshot(globalState)
  const { models } = snap.models
  const model = models.find(m => m.id === props.model)

  const { handleSubmit, itemProps } = useForm<Model>({
    initialValues: {
      id: model?.id || '',
      model: model?.model || '',
      name: model?.name || '',
      description: model?.description || '',
      features: Array.from(model?.features || []),
      suggestions: Array.from(model?.suggestions || []),
      capabilities: Object.keys(model?.capabilities || {}),
      speed: String(model?.speed || 3),
      intelligence: String(model?.intelligence || 3),
      context: String(model?.context || 8),
      provider: model?.provider || 'openai',
      provider_name: model?.provider_name || 'OpenAI',
      provider_brand: model?.provider_brand || 'openai',
      status: model?.status || '',
    },
    onSubmit: async (values) => {
      const model = {
        ...values,
        capabilities: values.capabilities.reduce((acc: { [key: string]: string }, key) => {
          acc[key] = ''
          return acc
        }, {}),
        speed: Number.parseInt(values.speed),
        intelligence: Number.parseInt(values.intelligence),
        context: Number.parseInt(values.context),
      }
      const built = build(API_MODEL_UPDATE)
      ofetch(built.url, {
        method: 'POST',
        headers: {
          token: built.token,
        },
        body: model,
      }).then(() => {
        showToast({
          style: Toast.Style.Success,
          title: 'Model Updated',
          message: 'Model has been updated successfully.',
        })
        navigation.pop()
        MutateState.models = true
      }).catch((e) => {
        showToast({
          style: Toast.Style.Failure,
          title: 'Model update failed',
          message: e.message || 'Unknown error.',
        })
      })
    },
    validation: {
      id: FormValidation.Required,
      model: FormValidation.Required,
      name: FormValidation.Required,
      // description: FormValidation.Required,
      features: FormValidation.Required,
    },
  })

  return (
    <Form
      actions={(
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      )}
      searchBarAccessory={
        <Form.LinkAccessory target="https://wibus-wee.github.io/raycast-unblock/" text="Open Documentation" />
      }
    >
      <Form.TextField
        title="Model ID"
        placeholder="Enter model ID (used in API)" // (used in API)
        info="This value is used in AI API requests"
        {...itemProps.model}
      />
      <Form.TextField
        title="Model Name"
        placeholder="Enter model name"
        info="This will be used to display in Raycast"
        {...itemProps.name}
      />
      <Form.TextArea
        title="Model Description"
        placeholder="Enter model description"
        info="This will be used to display in Raycast"
        {...itemProps.description}
      />
      <Form.TagPicker
        title="Features"
        info="These are the features that the model supports. Select different features to use the model in different functionalities."
        {...itemProps.features}
      >
        <Form.TagPicker.Item value="chat" title="Chat" icon="💬" />
        <Form.TagPicker.Item value="quick_ai" title="Quick AI" icon="🚀" />
        <Form.TagPicker.Item value="commands" title="Commands" icon="🔍" />
        <Form.TagPicker.Item value="api" title="API" icon="🔗" />
        <Form.TagPicker.Item value="emoji_search" title="Emoji Search" icon="😀" />
      </Form.TagPicker>
      <Form.TagPicker
        title="Suggestions"
        info="These are the suggestions that the model supports. Select different recommendations to display this model in different functionalities."
        {...itemProps.suggestions}
      >
        <Form.TagPicker.Item value="chat" title="Chat" icon="💬" />
        <Form.TagPicker.Item value="quick_ai" title="Quick AI" icon="🚀" />
        <Form.TagPicker.Item value="commands" title="Commands" icon="🔍" />
      </Form.TagPicker>
      <Form.TagPicker
        title="Capabilities"
        info="These are the capabilities that the model supports. Select different capabilities to use the model in different functionalities."
        {...itemProps.capabilities}
      >
        <Form.TagPicker.Item value="image_generation" title="Image Generation" icon="🖼️" />
        <Form.TagPicker.Item value="web_search" title="Web Search" icon="🔍" />
      </Form.TagPicker>
      <Form.Separator />
      <Form.TextField
        title="Model Speed"
        placeholder="Enter model speed"
        info="This will be only used to display in Raycast. Not used in AI. It should be a number between 1 and 5."
        {...itemProps.speed}
      />
      <Form.TextField
        title="Model Intelligence"
        placeholder="Enter model intelligence"
        info="This will be only used to display in Raycast. Not used in AI. It should be a number between 1 and 5."
        {...itemProps.intelligence}
      />
      <Form.TextField
        title="Model Context"
        placeholder="Enter model context"
        info="This will be only used to display in Raycast. Not used in AI. It should be a number. (k)"
        {...itemProps.context}
      />
      <Form.Separator />
      <Form.TextField
        title="Raycast Model ID"
        placeholder="Enter model ID (used in Raycast)"
        info="This value is used in Raycast"
        {...itemProps.id}
      />
      <Form.TextField
        title="Model Provider"
        placeholder="Enter model provider"
        info="This will be used to differentiate between different model providers in Raycast Unblock"
        {...itemProps.provider}
      />
      <Form.TextField
        title="Model Provider Brand"
        placeholder="Enter model provider brand"
        info="This will be used to display in Raycast. It should be a existing brand in Raycast, if not it will crash the api."
        {...itemProps.provider_brand}
      />
      <Form.TextField
        title="Model Provider Name"
        placeholder="Enter model provider name"
        info="This will be used to display in Raycast"
        {...itemProps.provider_name}
      />
      <Form.Separator />
      <Form.TextField
        title="Model Status"
        placeholder="Enter model status"
        info="This will be used to display in Raycast. It should be a string."
        {...itemProps.status}
      />
    </Form>
  )
}
