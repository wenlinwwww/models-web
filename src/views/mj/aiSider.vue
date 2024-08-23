<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { NAvatar, NTooltip } from 'naive-ui'
import { useRouter } from 'vue-router'
import { HoverButton, SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { homeStore, useChatStore, useUserStore } from '@/store'
import defaultAvatar from '@/assets/avatar.jpg'
import { router } from '@/router'
import { isDisableMenu } from '@/api'
const { isMobile } = useBasicLayout()

// import gallery from '@/views/gallery/index.vue'

const chatStore = useChatStore()
const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))
const userStore = useUserStore()

const st = ref({ show: false, showImg: false, menu: [], active: 'chat' })

const userInfo = computed(() => userStore.userInfo)

const urouter = useRouter() //

const goHome = computed(() => {
  // router.push('/')
  return router.currentRoute.value.name
})
// const go=(n:string)=>{
//   if('chat'==n){
//         router.push('/chat/'+ chatStore.active??'1002')
//     }
//     if('draw'==n){
//         router.push('/draw/'+ chatStore.active??'1002')
//         st.value.show=true;
//     }
// }
// mlog('g', goHome() );
const chatId = computed(() => chatStore.active ?? '1002')

const navigateWithoutHash = (url) => {
  // window.location.href = url;
  if (window.confirm('百度文库现已提供将文档转换为PPT的功能，并支持自定义PPT模板。但由于百度不支持多人共享账号，因此我们仅能提供链接，您需要自行登录使用。点击“确定”后将跳转至相应网址。'))
    window.open(url, '_blank')
}
</script>

<template>
  <div v-if="!isMobile" class="flex-shrink-0 w-[60px] z-[1000]  h-full" data-tauri-drag-region>
    <div class="flex h-full select-none flex-col items-center justify-between bg-[#e8eaf1] px-2 pt-4 pb-8 dark:bg-[#25272d]">
      <div class="flex flex-col space-y-4 flex-1 " :class="{ 'pt-5': homeStore.myData.isClient }" data-tauri-drag-region>
        <a class="router-link-active router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]" @click="st.active = 'chat'; urouter.push(`/chat`)">
          <NTooltip placement="right" trigger="hover">
            <template #trigger>
              <div class="flex h-full justify-center items-center py-1 flex-col " :class="[goHome == 'Chat' ? 'active' : '']">
                <SvgIcon icon="ri:wechat-line" class="text-3xl  flex-1" />
                <span class="text-[10px]">{{ $t('mjtab.chat') }}</span>
              </div>
            </template>
            AI Chat
          </NTooltip>
        </a>
        <a v-if="!isDisableMenu ('gpts')" class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]" @click="homeStore.setMyData({ act: 'showgpts' }) ">
          <NTooltip placement="right" trigger="hover">
            <template #trigger>
              <div class="flex h-full justify-center items-center   py-1 flex-col">
                <SvgIcon icon="ri:apps-fill" class="text-3xl flex-1" />
                <span class="text-[10px]">GPTs</span>
              </div>
            </template>
            ChatGPT Store
          </NTooltip>
        </a>

        <a v-if="!isDisableMenu ('draws')" class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]" @click="st.active = 'draw'; urouter.push(`/draw`)">
          <NTooltip placement="right" trigger="hover">
            <template #trigger>
              <div class="flex h-full justify-center items-center   py-1 flex-col" :class="[goHome == 'draw' ? 'active' : '']">
                <SvgIcon icon="ic:outline-palette" class="text-3xl flex-1" />
                <span class="text-[10px]">{{ $t('mjtab.draw') }}</span>
              </div>
            </template>
            {{ $t('mjtab.drawinfo') }}
          </NTooltip>
        </a>

        <a v-if="!isDisableMenu ('gallery')" class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]" @click="homeStore.setMyData({ act: 'gallery' }) ">
          <NTooltip placement="right" trigger="hover">
            <template #trigger>
              <div class="flex h-full justify-center items-center   py-1 flex-col">
                <SvgIcon icon="material-symbols:imagesmode-outline" class="text-3xl flex-1" />
                <span class="text-[10px]">{{ $t('mjtab.gallery') }}</span>
              </div>
            </template>
            {{ $t('mjtab.galleryInfo') }}
          </NTooltip>
        </a>

        <a v-if="!isDisableMenu ('music')" class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]" @click="st.active = 'music'; urouter.push('/music')">
          <NTooltip placement="right" trigger="hover">
            <template #trigger>
              <div class="flex  h-full justify-center items-center py-1 flex-col " :class="[goHome == 'music' ? 'active' : '']">
                <SvgIcon icon="arcticons:wynk-music" class="text-3xl flex-1" />
                <span class="text-[10px]">{{ $t('suno.menu') }}</span>
              </div>
            </template>
            {{ $t('suno.menuinfo') }}
          </NTooltip>
        </a>

        <a
          v-if="!isDisableMenu ('video')" class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]"
          @click="st.active = 'video'; urouter.push('/video')"
        >
          <NTooltip placement="right" trigger="hover">
            <template #trigger>
              <div class="flex  h-full justify-center items-center py-1 flex-col " :class="[goHome == 'video' ? 'active' : '']">
                <SvgIcon icon="ri:video-on-line" class="text-3xl flex-1" />
                <span class="text-[10px]">{{ $t('video.menu') }}</span>
              </div>
            </template>
            {{ $t('video.menuinfo') }}
          </NTooltip>
        </a>

        <a
          v-if="!isDisableMenu ('dance')" class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]"
          @click="st.active = 'dance'; urouter.push('/dance')"
        >
          <NTooltip placement="right" trigger="hover">
            <template #trigger>
              <div class="flex  h-full justify-center items-center py-1 flex-col " :class="[goHome == 'dance' ? 'active' : '']">
                <SvgIcon icon="mdi:dance-ballroom" class="text-3xl flex-1" />
                <span class="text-[10px]">{{ $t('dance.menu') }}</span>
              </div>
            </template>
            {{ $t('dance.menuinfo') }}
          </NTooltip>
        </a>

        <a
          v-if="!isDisableMenu('ppt')"
          class="router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]"
          @click.prevent="navigateWithoutHash('https://wenku.baidu.com/?fr=logo&amp;_wkts_=1723767901637')"
        >
          <NTooltip placement="right" trigger="hover">
            <template #trigger>
              <div class="flex h-full justify-center items-center py-1 flex-col">
                <SvgIcon icon="material-symbols:edit-document-outline" class="text-3xl flex-1" />
                <span class="text-[10px]">{{ $t('mjtab.ppt') }}</span>
              </div>
            </template>
            百度文库PPT 自动生成
          </NTooltip>
        </a>
      </div>
      <div class="flex flex-col  space-y-2 ">
        <NAvatar
          v-if="userInfo.avatar" size="large" round :src="userInfo.avatar" :fallback-src="defaultAvatar"
          class=" cursor-pointer"
        />

        <HoverButton>
          <div class="text-xl text-[#4f555e] dark:text-white flex h-full justify-center items-center " @click="st.show = true">
            <SvgIcon icon="ri:settings-4-line" />
          </div>
        </HoverButton>
      </div>
    </div>
  </div>
  <Setting v-if="st.show" v-model:visible="st.show" />

  <!-- <n-drawer v-model:show="st.showImg" :placement="isMobile?'bottom':'right'"  :class="isMobile?['!h-[90vh]']: ['!w-[80vw]']" style="--n-body-padding:0">
    <n-drawer-content title="GPT store" closable>
      sdsd
    </n-drawer-content>
</n-drawer> -->
</template>
