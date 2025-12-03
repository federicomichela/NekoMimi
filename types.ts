
export enum PetAction {
  IDLE = 'IDLE',
  WALK = 'WALK',
  JUMP = 'JUMP',
  SIT = 'SIT',
  ROLL = 'ROLL',
  PAT = 'PAT',
  STRIKE = 'STRIKE',
  CALL = 'CALL',
}

export interface PetState {
  action: PetAction;
  mood: string;
  lastUpdate: number;
  navigation: { x: number; z: number };
}

export interface GestureResponse {
  action: PetAction;
  reasoning: string;
  mood: string;
  navigation: { x: number; z: number };
}
