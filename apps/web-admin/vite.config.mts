import { defineConfig } from '@vben/vite-config';
import { loadEnv } from 'vite';

export default defineConfig(async (config) => {
  const command = config?.command ?? 'serve';
  const mode = config?.mode ?? 'development';
  const env = loadEnv(mode, process.cwd(), '');
  const isDesktopDev = mode === 'desktop-dev';
  const apiTarget =
    process.env.ELECTRON_API_TARGET ??
    (isDesktopDev ? env.VITE_DESKTOP_API_TARGET : env.VITE_DEV_API_TARGET);

  if (command === 'serve' && isDesktopDev && !apiTarget) {
    throw new Error(
      `Missing VITE_DESKTOP_API_TARGET in apps/web-admin/.env.${mode}`,
    );
  }

  const server = command === 'serve' && apiTarget
    ? {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            // target: 'http://localhost:5320/api',
            // 本地有后端时优先用 localhost，远程代理会明显拖慢首屏接口
            target: apiTarget,
            ws: true,
          },
        },
      }
    : undefined;

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
      server,
    },
  };
});
