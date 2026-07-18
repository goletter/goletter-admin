import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    enableCheckUpdates: false,
    defaultHomePath: '/analytics',
    locale: 'zh-CN',
    enablePreferences: false,
    authPageLayout: 'panel-center',
  },
  copyright: {
    companyName: 'GeekDance',
    companySiteLink: 'https://floletic.test.geekdance.cn/admin/',
    date: '2025',
  },
  theme: {
    mode: 'light',
  },
  logo: {
    enable: true,
    fit: 'cover',
    source: import.meta.env.VITE_APP_LOGO,
  },
  widget: {
    themeToggle: false,
    notification: false,
    globalSearch: false,
    languageToggle: false,
  },
});
