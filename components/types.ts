export type Item = {
  id: string;
  object: string; // e.g. "realtime.item"
  type: "message" | "function_call" | "function_call_output";
  timestamp?: string;
  status?: "running" | "completed";
  // For "message" items
  role?: "system" | "user" | "assistant" | "tool";
  content?: { type: string; text: string }[];
  // For "function_call" items
  name?: string;
  call_id?: string;
  params?: Record<string, any>;
  arguments?: string;
  // For "function_call_output" items
  output?: string;
};

export interface PhoneNumber {
  sid: string;
  friendlyName: string;
  voiceUrl?: string;
}

export type FunctionCall = {
  name: string;
  params: Record<string, any>;
  completed?: boolean;
  response?: string;
  status?: string;
  call_id?: string; // ensure each call has a call_id
};

// 통화 상태 타입
export type CallStatus = "idle" | "connecting" | "connected" | "active" | "ended" | "error";

// 통화 정보 타입
export interface CallInfo {
  sessionId?: string;
  callSid?: string;
  elderId?: string;
  phoneNumber?: string;
  status: CallStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // seconds
  participants: {
    caller: string;
    assistant: string;
  };
}

// 통화 품질 정보
export interface CallQuality {
  connectionQuality: "excellent" | "good" | "fair" | "poor";
  audioQuality: "excellent" | "good" | "fair" | "poor";
  latency?: number; // ms
  packetsLost?: number;
  jitter?: number;
}

// 통화 통계
export interface CallStats {
  messageCount: number;
  functionCallCount: number;
  totalSpeechTime: number; // seconds
  avgResponseTime: number; // ms
}
