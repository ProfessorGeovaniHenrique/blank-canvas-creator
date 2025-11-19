/**
 * Web Worker para compressão/descompressão assíncrona
 * Evita congelar a UI durante operações pesadas
 */
import LZString from 'lz-string';

interface WorkerMessage {
  action: 'compress' | 'decompress';
  data: string;
  id: string;
}

interface WorkerResponse {
  result: string | null;
  error?: string;
  id: string;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { action, data, id } = e.data;
  
  try {
    let result: string | null = null;
    
    if (action === 'compress') {
      result = LZString.compress(data);
    } else if (action === 'decompress') {
      result = LZString.decompress(data);
    }
    
    const response: WorkerResponse = { result, id };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      result: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      id
    };
    self.postMessage(response);
  }
};
