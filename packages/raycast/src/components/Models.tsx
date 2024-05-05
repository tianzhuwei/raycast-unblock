import React from 'react'
import { useSnapshot } from 'valtio'
import { Action, ActionPanel, Icon, List } from '@raycast/api'
import { getAvatarIcon } from '@raycast/utils'
import { globalState } from '../state/global'
import { UniversalActions } from './universal/Actions'
import { EditModelForm } from './EditModelForm'

export function Models() {
  const snap = useSnapshot(globalState)
  const { models } = snap.models

  return (
    <List.Section title="Models">
      {models?.map(model => (
        <List.Item
          icon={getAvatarIcon(model.provider_name)}
          key={model.id}
          title={model.name}
          subtitle={model.provider_name}
          accessories={[
            {
              text: model.id,
            },
          ]}
          detail={(
            <List.Item.Detail
              // markdown={model.description}
              metadata={(
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Model" text={model.model} />
                  <List.Item.Detail.Metadata.Label title="Provider" text={model.provider} />
                  <List.Item.Detail.Metadata.Label title="Speed" text={model.speed.toString()} />
                  <List.Item.Detail.Metadata.Label title="Intelligence" text={model.intelligence.toString()} />
                  <List.Item.Detail.Metadata.Label title="Context" text={model.context.toString()} />
                  <List.Item.Detail.Metadata.TagList title="Features">
                    {model.features.map(feature => (
                      <List.Item.Detail.Metadata.TagList.Item key={feature} text={feature} color="rgb(199,209,232)" />
                    ))}
                  </List.Item.Detail.Metadata.TagList>
                  <List.Item.Detail.Metadata.TagList title="Suggestions">
                    {model.suggestions.length > 0
                      ? (
                          model.suggestions.map(suggestion => (
                            <List.Item.Detail.Metadata.TagList.Item key={suggestion} text={suggestion} color="#eed535" />
                          ))
                        )
                      : (
                        <List.Item.Detail.Metadata.TagList.Item text="No suggestions" />
                        )}
                  </List.Item.Detail.Metadata.TagList>
                  <List.Item.Detail.Metadata.TagList title="Capabilities">
                    {
                      Object.entries(model.capabilities).length > 0
                        ? (
                            Object.entries(model.capabilities).map(([key]) => (
                              <List.Item.Detail.Metadata.TagList.Item key={key} text={`${key}`} color="rgb(208,197,199)" />
                            ))
                          )
                        : (
                          <List.Item.Detail.Metadata.TagList.Item text="No capabilities" />
                          )
                    }
                  </List.Item.Detail.Metadata.TagList>
                  {
                    (model.status as string | null) && (
                      <List.Item.Detail.Metadata.TagList title="Status">
                        <List.Item.Detail.Metadata.TagList.Item text={`${(model.status as string).toUpperCase()}`} color="#CE9278" />
                      </List.Item.Detail.Metadata.TagList>
                    )
                  }
                </List.Item.Detail.Metadata>
              )}
            />
          )}
          actions={(
            <ActionPanel>
              <UniversalActions />
              <Action.Push
                title="Edit Model"
                icon={Icon.Pencil}
                shortcut={{ modifiers: ['cmd'], key: 'e' }}
                target={<EditModelForm model={model.id} />}
              />
            </ActionPanel>
          )}
        />
      ))}
    </List.Section>
  )
}
