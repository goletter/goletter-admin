import type { MenuRecordRaw } from '@vben/types';

import { useAccessStore } from '@vben/stores';

export interface SetMenuBadgeOptions {
  path: string;
  count: number;
  badgeType?: 'dot' | 'normal';
  badgeVariants?: string;
}

function cloneMenus(menus: MenuRecordRaw[]): MenuRecordRaw[] {
  return menus.map((menu) => ({
    ...menu,
    children: menu.children ? cloneMenus(menu.children) : undefined,
  }));
}

function patchMenuBadge(
  menus: MenuRecordRaw[],
  options: SetMenuBadgeOptions,
): boolean {
  const { path, count, badgeType = 'normal', badgeVariants = 'destructive' } =
    options;

  for (const menu of menus) {
    if (menu.path === path) {
      if (badgeType === 'dot') {
        menu.badge = undefined;
        menu.badgeType = count > 0 ? 'dot' : undefined;
        menu.badgeVariants = count > 0 ? badgeVariants : undefined;
      } else if (count > 0) {
        menu.badge = count > 99 ? '99+' : String(count);
        menu.badgeType = 'normal';
        menu.badgeVariants = badgeVariants;
      } else {
        menu.badge = undefined;
        menu.badgeType = undefined;
        menu.badgeVariants = undefined;
      }
      return true;
    }
    if (menu.children?.length && patchMenuBadge(menu.children, options)) {
      return true;
    }
  }
  return false;
}

/** 更新侧边栏菜单徽标数字 / 红点 */
export function setMenuBadge(options: SetMenuBadgeOptions) {
  const accessStore = useAccessStore();
  const menus = cloneMenus(accessStore.accessMenus);
  if (!patchMenuBadge(menus, options)) {
    return false;
  }
  accessStore.setAccessMenus(menus);
  return true;
}
