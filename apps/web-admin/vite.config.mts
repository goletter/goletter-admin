import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {
      // 开发环境不启 mock / PWA，减少冷启动开销
      nitroMock: false,
      pwa: false,
    },
    vite: {
      optimizeDeps: {
        // 预构建高频依赖，避免首次打开页面时反复发现并重优化
        include: [
          'ant-design-vue',
          'ant-design-vue/es',
          '@vueuse/core',
          'dayjs',
          'pinia',
          'vue',
          'vue-router',
        ],
      },
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            // target: 'http://localhost:5320/api',
            // 本地有后端时优先用 localhost，远程代理会明显拖慢首屏接口
            target: 'https://floletic.test.geekdance.cn/api',
            ws: true,
          },
        },
      },
    },
  };
});
