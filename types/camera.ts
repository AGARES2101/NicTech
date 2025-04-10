export interface Camera {
  ID: string;
  Name: string;
  Description?: string;
  Disabled: boolean;
  ModelName?: string;
  ReceiveAudio: boolean;
  SecondSourceEnabled: boolean;
  PtzMoveEnabled: boolean;
  PtzZoomEnabled: boolean;
  ArchiveStart?: string;
  ArchiveEnd?: string;
}

export interface CameraState {
  ID: string;
  Name: string;
  FullGroupName?: string;
  State: 'Disabled' | 'Error' | 'RecordingIsOff' | 'Writing' | 'NotWriting';
}
