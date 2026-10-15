import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { VisualizationMessage, VisualizationPoint } from '../types/visualization.interface';

export interface VisualizationConnectionEvent {
  readonly type: 'connection'
  readonly connected: boolean
}

export type VisualizationEvent = VisualizationConnectionEvent | VisualizationMessage;

const initialReconnectDelayMs = 1000;
const maximumReconnectDelayMs = 15000;
const reconnectMultiplier = 2;
const minimumCoordinate = -100;
const maximumCoordinate = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPoint(value: unknown): value is VisualizationPoint {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value['id'] === 'string'
    && typeof value['x'] === 'number' && Number.isFinite(value['x']) && value['x'] >= minimumCoordinate && value['x'] <= maximumCoordinate
    && typeof value['y'] === 'number' && Number.isFinite(value['y']) && value['y'] >= minimumCoordinate && value['y'] <= maximumCoordinate;
}

function parseMessage(data: unknown): VisualizationMessage | null {
  if (typeof data !== 'string') {
    return null;
  }

  try {
    const value: unknown = JSON.parse(data);

    if (!isRecord(value)) {
      return null;
    }

    if (value['type'] === 'snapshot' && Array.isArray(value['points']) && value['points'].every(isPoint) && typeof value['total'] === 'number') {
      return { type: 'snapshot', points: value['points'], total: value['total'] };
    }

    if (value['type'] === 'point' && isPoint(value['point']) && typeof value['total'] === 'number') {
      return { type: 'point', point: value['point'], total: value['total'] };
    }
  }
  catch {
    return null;
  }

  return null;
}

@Injectable({ providedIn: 'root' })
export class VisualizationPageService {
  public connect(): Observable<VisualizationEvent> {
    return new Observable((subscriber) => {
      let socket: WebSocket | null = null;
      let reconnectTimer: number | null = null;
      let reconnectDelay = initialReconnectDelayMs;
      let stopped = false;

      const connect = (): void => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

        socket = new WebSocket(`${protocol}//${window.location.host}/visualization/live`);
        socket.addEventListener('open', () => {
          reconnectDelay = initialReconnectDelayMs;
          subscriber.next({ type: 'connection', connected: true });
        });
        socket.addEventListener('message', (event) => {
          const message = parseMessage(event.data);

          if (message !== null) {
            subscriber.next(message);
          }
        });
        socket.addEventListener('close', () => {
          subscriber.next({ type: 'connection', connected: false });

          if (!stopped) {
            reconnectTimer = window.setTimeout(connect, reconnectDelay);
            reconnectDelay = Math.min(reconnectDelay * reconnectMultiplier, maximumReconnectDelayMs);
          }
        });
      };

      connect();

      return () => {
        stopped = true;

        if (reconnectTimer !== null) {
          window.clearTimeout(reconnectTimer);
        }

        socket?.close();
      };
    });
  }
}
