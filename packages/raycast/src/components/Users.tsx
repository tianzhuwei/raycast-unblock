import { ActionPanel, Image, List } from '@raycast/api'
import { useSnapshot } from 'valtio'
import { globalState } from '../state/global'
import { UniversalActions } from './universal/Actions'

export function Users() {
  const snap = useSnapshot(globalState)
  const data = snap.users
  return data?.users.map(user => (
    <List.Item
      key={user.id}
      title={user.name}
      subtitle={user.email}
      icon={{
        source: user.avatar.url,
        mask: Image.Mask.Circle,
      }}
      detail={(
        <List.Item.Detail
          metadata={(
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="ID" text={user.id} />
              <List.Item.Detail.Metadata.Label title="Username" text={user.username} />
              <List.Item.Detail.Metadata.Label title="Email" text={user.email} />
              <List.Item.Detail.Metadata.Label title="Login Devices" text={user.tokens.length.toString()} />
              {
                user.lastSync && (
                  <List.Item.Detail.Metadata.Label title="Last Sync" text={`${new Date(user.lastSync).toDateString()} · ${new Date(user.lastSync).toLocaleTimeString()}`} />
                )
              }
              <List.Item.Detail.Metadata.TagList title="Avatar">
                <List.Item.Detail.Metadata.TagList.Item
                  text={user.avatar.placeholder}
                  color={user.avatar.placeholder}
                />
              </List.Item.Detail.Metadata.TagList>
            </List.Item.Detail.Metadata>
          )}
        />
      )}
      actions={(
        <ActionPanel>
          <UniversalActions />
        </ActionPanel>
      )}
    />
  ))
}
