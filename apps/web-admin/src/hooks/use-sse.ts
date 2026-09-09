import type { SseConnection, SseOptions } from '#/api/sse';

import { onUnmounted, shallowRef } from 'vue';

import { createSse } from '#/api/sse';

/**
 * 在组件内建立 SSE，卸载时自动关闭
 */
export function useSse(options: SseOptions | null) {
  const connection = shallowRef<SseConnection | null>(null);

  function close() {
    connection.value?.close();
    connection.value = null;
  }

  function connect(next?: SseOptions) {
    const opts = next ?? options;
    close();
    if (!opts) return;
    connection.value = createSse(opts);
  }

  if (options) {
    connect(options);
  }

  onUnmounted(close);

  return {
    connection,
    connect,
    close,
  };
}
