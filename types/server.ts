interface BaseApiResponse {
  success: boolean;
  message?: string;
}

interface CameraData {
  ID: string;
  Name: string;
  Description: string;
  Disabled: boolean;
  ModelName: string;
  ReceiveAudio: boolean;
  SecondSourceEnabled: boolean;
  PtzMoveEnabled: boolean;
  PtzZoomEnabled: boolean;
  ArchiveStart?: string;
  ArchiveEnd?: string;
}

interface StreamConfig {
  url: string;
  protocol: 'http' | 'https';
  port: number;
  streamType: 'mjpeg' | 'stream' | 'mpeg-ts';
  framerate?: number;
  streamIndex?: 0 | 1;
  viewSize?: string;
}

export type { BaseApiResponse, CameraData, StreamConfig }
