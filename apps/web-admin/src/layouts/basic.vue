<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import type { SseMenuBadgeMessage, SseNotificationMessage } from '#/api/sse';

import { computed, ref, watch } from 'vue';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { useWatermark } from '@vben/hooks';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import { notification as antNotification } from 'ant-design-vue';

import { useSse } from '#/hooks/use-sse';
import { useAuthStore } from '#/store';
import { setMenuBadge } from '#/utils/menu-badge';
import LoginForm from '#/views/_core/authentication/login.vue';

const notifications = ref<NotificationItem[]>([]);

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const { connect: connectSse, close: closeSse } = useSse(null);

const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => []);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

function isMenuBadgeMessage(data: unknown): data is SseMenuBadgeMessage {
  return (
    !!data &&
    typeof data === 'object' &&
    'path' in data &&
    'count' in data &&
    typeof (data as SseMenuBadgeMessage).path === 'string' &&
    typeof (data as SseMenuBadgeMessage).count === 'number'
  );
}

function isNotificationMessage(data: unknown): data is SseNotificationMessage {
  return (
    !!data &&
    typeof data === 'object' &&
    'title' in data &&
    typeof (data as SseNotificationMessage).title === 'string'
  );
}

function handleSseMessage(data: unknown, event: string) {
  if (event === 'menu-badge' || isMenuBadgeMessage(data)) {
    if (!isMenuBadgeMessage(data)) return;
    setMenuBadge({
      path: data.path,
      count: data.count,
      badgeType: data.badgeType,
      badgeVariants: data.badgeVariants,
    });
    return;
  }

  if (event === 'notification' || isNotificationMessage(data)) {
    if (!isNotificationMessage(data)) return;
    notifications.value.unshift({
      avatar: data.avatar ?? preferences.app.defaultAvatar,
      date: data.date ?? new Date().toLocaleString(),
      isRead: false,
      message: data.message ?? '',
      title: data.title,
    });
    antNotification.info({
      message: data.title,
      description: data.message || undefined,
      placement: 'topRight',
    });
  }
}

function startSse() {
  connectSse({
    events: ['menu-badge', 'notification'],
    onMessage: handleSseMessage,
    onError: (error) => {
      console.warn('[SSE]', error);
    },
  });
}

async function handleLogout() {
  closeSse();
  await authStore.logout(false);
}

function handleNoticeClear() {
  notifications.value = [];
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}

const sseEnabled = import.meta.env.VITE_SSE_ENABLED === 'true';

// token + 菜单就绪后再连；登出 / 关闭开关时断开
watch(
  () => [accessStore.accessToken, accessStore.isAccessChecked] as const,
  ([token, checked]) => {
    if (sseEnabled && token && checked) {
      startSse();
    } else {
      closeSse();
    }
  },
  { immediate: true },
);

watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.username} - ${userStore.userInfo?.realName || ''}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName || ''"
        description=""
        tag-text=""
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @make-all="handleMakeAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
