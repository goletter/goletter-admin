<script lang="ts" setup>
import { onMounted } from 'vue';
// import { deleteRole, getRoleList } from '#/api/system/role';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

const userStore = useUserStore();
const logoLong = import.meta.env.VITE_APP_LOGO;
onMounted(async () => {});
</script>

<template>
  <Page auto-content-height>
    <div class="bg-background flex h-full flex-col items-center justify-center">
      <div class="logo">
        <img :src="logoLong" alt="巨融企服CRM" width="600" />
      </div>

      <div class="flag mt-5">欢迎回来，{{ userStore.userInfo?.realName }}</div>
    </div>
  </Page>
</template>
<style lang="css">
.logo {
  width: 60%;
}
.logo img {
  margin: 0 auto;
}
.flag {
  font-size: 4rem;
}
</style>
