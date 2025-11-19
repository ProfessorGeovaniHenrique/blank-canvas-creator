/**
 * Sincronização de cache entre tabs usando BroadcastChannel
 */

interface CacheUpdateMessage {
  cacheKey: string;
  action: 'saved' | 'deleted' | 'cleared';
  timestamp: number;
}

let cacheChannel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel {
  if (!cacheChannel) {
    cacheChannel = new BroadcastChannel('corpus-cache-updates');
  }
  return cacheChannel;
}

/**
 * Notifica outras tabs sobre mudanças no cache
 */
export function broadcastCacheUpdate(cacheKey: string, action: 'saved' | 'deleted' | 'cleared') {
  try {
    const channel = getChannel();
    const message: CacheUpdateMessage = {
      cacheKey,
      action,
      timestamp: Date.now()
    };
    channel.postMessage(message);
    console.log('📡 Broadcast cache update:', message);
  } catch (error) {
    console.warn('⚠️ Failed to broadcast cache update:', error);
  }
}

/**
 * Escuta mudanças de cache de outras tabs
 */
export function listenToCacheUpdates(
  onUpdate: (cacheKey: string, action: 'saved' | 'deleted' | 'cleared') => void
): () => void {
  try {
    const channel = getChannel();
    
    const handler = (event: MessageEvent<CacheUpdateMessage>) => {
      console.log('📡 Received cache update from another tab:', event.data);
      onUpdate(event.data.cacheKey, event.data.action);
    };
    
    channel.addEventListener('message', handler);
    
    // Retornar função de cleanup
    return () => {
      channel.removeEventListener('message', handler);
    };
  } catch (error) {
    console.warn('⚠️ Failed to setup cache sync listener:', error);
    return () => {}; // Noop cleanup
  }
}

/**
 * Fechar canal ao encerrar
 */
export function closeCacheSync() {
  if (cacheChannel) {
    cacheChannel.close();
    cacheChannel = null;
  }
}
