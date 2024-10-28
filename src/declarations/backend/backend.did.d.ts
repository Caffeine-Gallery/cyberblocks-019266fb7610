import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface HighScore { 'name' : string, 'score' : bigint }
export interface _SERVICE {
  'addHighScore' : ActorMethod<[string, bigint], Array<HighScore>>,
  'getHighScores' : ActorMethod<[], Array<HighScore>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
