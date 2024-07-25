import { ss } from '@/utils/storage'
import { t } from '@/locales'
const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string
  name: string
  description: string
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: 'https://raw.githubusercontent.com/wenlinwwww/chatgpt-web-midjourney-proxy/main/src/assets/avatar.jpg',
      name: t('mjset.sysname'), // 'AI绘图',
      description: '<a href="https://docs.qq.com/doc/p/75f8b578cd31a19224b6092d7f670bb5cf44a542" class="text-blue-500" target="_blank" >使用手册</a>',
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
