import { Action, Icon, openExtensionPreferences } from '@raycast/api'
import { useSnapshot } from 'valtio'
import { globalState } from '../../state/global'

export function UniversalActions() {
  const snap = useSnapshot(globalState)

  return (
    <>
      <Action
        title="Toggle Detail"
        onAction={() => {
          globalState.isShowingDetail = !snap.isShowingDetail
        }}
        icon={Icon.AppWindowSidebarRight}
      />
      <Action
        title="Open Extension Preferences"
        onAction={openExtensionPreferences}
      />
    </>
  )
}
