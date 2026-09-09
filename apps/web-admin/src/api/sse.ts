import { useAppConfig } from '@vben/hooks';

import { requestClient } from '#/api/request';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

/** 换票接口（需登录 Authorization） */
const SSE_TICKET_URL = '/sse/ticket';
/** EventSource 长连接（用 ticket，不带 Authorization） */
const SSE_CONNECT_PATH = '/sse/connect';

export interface SseOptions {
  /**
   * 要监听的业务事件名（对应后端 event()）
   * @default ['menu-badge', 'notification', 'message']
   */
  events?: string[];
  /** 收到事件回调（data 已 JSON.parse，失败则返回原始字符串） */
  onMessage?: (data: unknown, event: string) => void;
  onOpen?: () => void;
  onError?: (error: unknown) => void;
  /** ticket 失效 / 断线后是否重新换票连接，默认 true */
  autoReconnect?: boolean;
  /** 重连间隔 ms，默认 3000 */
  reconnectInterval?: number;
}

export interface SseConnection {
  close: () => void;
}

/** 菜单徽标推送 */
export interface SseMenuBadgeMessage {
  type?: 'menu-badge';
  path: string;
  count: number;
  badgeType?: 'dot' | 'normal';
  badgeVariants?: string;
}

/** 通知推送 */
export interface SseNotificationMessage {
  type?: 'notification';
  title: string;
  message?: string;
  avatar?: string;
  date?: string;
}

export type SseMessage = SseMenuBadgeMessage | SseNotificationMessage;

interface TicketResult {
  ticket?: string;
  ttl?: number;
  data?: { ticket?: string; ttl?: number };
}

function buildConnectUrl(ticket: string) {
  const base = apiURL.replace(/\/$/, '');
  const path = `${base}${SSE_CONNECT_PATH}`;
  const url = new URL(path, window.location.origin);
  url.searchParams.set('ticket', ticket);
  return url.toString();
}

function parseEventData(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function fetchTicket(): Promise<string> {
  const res = await requestClient.post<TicketResult>(SSE_TICKET_URL);
  const ticket = res?.ticket ?? res?.data?.ticket;
  if (!ticket) {
    throw new Error('获取 SSE ticket 失败：响应中无 ticket');
  }
  return ticket;
}

/**
 * 按 goletter/hyperf-sse 约定：
 * 1) POST /sse/ticket（Authorization）换短时 ticket
 * 2) EventSource(/sse/connect?ticket=) 建立长连接
 */
export function createSse(options: SseOptions = {}): SseConnection {
  const {
    events = ['menu-badge', 'notification', 'message'],
    onMessage,
    onOpen,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
  } = options;

  let aborted = false;
  let eventSource: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  const eventNames = [...new Set(events)];

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const disposeEventSource = () => {
    if (!eventSource) return;
    eventSource.onopen = null;
    eventSource.onerror = null;
    eventSource.close();
    eventSource = null;
  };

  const scheduleReconnect = () => {
    if (aborted || !autoReconnect || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect();
    }, reconnectInterval);
  };

  const bindEvents = (es: EventSource) => {
    const handleEvent = (eventName: string) => (e: MessageEvent) => {
      onMessage?.(parseEventData(String(e.data ?? '')), eventName);
    };

    for (const name of eventNames) {
      es.addEventListener(name, handleEvent(name) as EventListener);
    }

    // 服务端空闲超时等主动关闭：关掉后换新 ticket 再连
    es.addEventListener('server_close', () => {
      disposeEventSource();
      scheduleReconnect();
    });

    es.onopen = () => {
      onOpen?.();
    };

    // EventSource 会用旧 ticket 自动重连（一次性 ticket 会失败），
    // 所以出错后主动 close，再走换票重连。
    es.onerror = () => {
      onError?.(new Error('SSE 连接异常'));
      disposeEventSource();
      scheduleReconnect();
    };
  };

  const connect = async () => {
    if (aborted) return;

    clearReconnectTimer();
    disposeEventSource();

    try {
      const ticket = await fetchTicket();
      if (aborted) return;

      const es = new EventSource(buildConnectUrl(ticket));
      eventSource = es;
      bindEvents(es);
    } catch (error) {
      if (aborted) return;
      onError?.(error);
      scheduleReconnect();
    }
  };

  void connect();

  return {
    close() {
      aborted = true;
      clearReconnectTimer();
      disposeEventSource();
    },
  };
}
