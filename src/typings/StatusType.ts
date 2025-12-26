export type CurrentStep = 
  | 'processing' 
  | 'transcribing'
  | 'summarizing'
  | 'pending' 
  | 'done' 
  | 'error'
  | 'listening' 
  | 'unknown';
