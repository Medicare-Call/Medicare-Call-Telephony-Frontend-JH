"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/top-bar";
import ChecklistAndConfig from "@/components/checklist-and-config";
import SessionConfigurationPanel from "@/components/session-configuration-panel";
import Transcript from "@/components/transcript";
import FunctionCallsPanel from "@/components/function-calls-panel";
import CallStartPanel from "@/components/call-start-panel";
import CallStatusPanel from "@/components/call-status-panel";
import { Item, CallInfo, CallStatus, CallStats, CallQuality } from "@/components/types";
import handleRealtimeEvent from "@/lib/handle-realtime-event";
import PhoneNumberChecklist from "@/components/phone-number-checklist";

const CallInterface = () => {
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [allConfigsReady, setAllConfigsReady] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [callStatus, setCallStatus] = useState("disconnected");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // 통화 정보 상태
  const [callInfo, setCallInfo] = useState<CallInfo>({
    status: "idle" as CallStatus,
    participants: {
      caller: "어르신",
      assistant: "AI 어시스턴트"
    }
  });
  
  // 통화 품질 정보
  const [callQuality, setCallQuality] = useState<CallQuality>({
    connectionQuality: "good",
    audioQuality: "good",
    latency: 150
  });
  
  // 통화 통계
  const [callStats, setCallStats] = useState<CallStats>({
    messageCount: 0,
    functionCallCount: 0,
    totalSpeechTime: 0,
    avgResponseTime: 1200
  });

  useEffect(() => {
    if (currentSessionId && !ws) {
      const backendWsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:3000";
      const newWs = new WebSocket(`${backendWsUrl}/logs/${currentSessionId}`);

      newWs.onopen = () => {
        console.log(`Connected to logs websocket for session: ${currentSessionId}`);
        setCallStatus("connected");
      };

      newWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received logs event:", data);
        handleRealtimeEvent(data, setItems, (quality) => {
          setCallQuality(prev => ({ ...prev, ...quality }));
        });
      };

      newWs.onclose = () => {
        console.log("Logs websocket disconnected");
        setWs(null);
        setCallStatus("disconnected");
      };

      setWs(newWs);
    }
  }, [currentSessionId, ws]);

  const handleCallStarted = (sessionData: any) => {
    console.log("Call started with session data:", sessionData);
    setCurrentSessionId(sessionData.sessionId);
    setItems([]); // 새 통화 시작시 기존 transcript 초기화
    
    // 통화 정보 업데이트
    setCallInfo({
      sessionId: sessionData.sessionId,
      callSid: sessionData.callSid,
      elderId: sessionData.elderId,
      phoneNumber: sessionData.phoneNumber,
      status: "connecting",
      startTime: new Date(),
      participants: {
        caller: `어르신 (${sessionData.elderId})`,
        assistant: "AI 어시스턴트"
      }
    });
    
    // 통계 초기화
    setCallStats({
      messageCount: 0,
      functionCallCount: 0,
      totalSpeechTime: 0,
      avgResponseTime: 1200
    });
  };

  // WebSocket 연결 상태에 따른 통화 상태 업데이트
  useEffect(() => {
    if (callStatus === "connected" && callInfo.status === "connecting") {
      setCallInfo(prev => ({ ...prev, status: "active" }));
    } else if (callStatus === "disconnected" && callInfo.status === "active") {
      setCallInfo(prev => ({ 
        ...prev, 
        status: "ended",
        endTime: new Date()
      }));
    }
  }, [callStatus, callInfo.status]);

  // 실시간으로 통계 업데이트
  useEffect(() => {
    const messageCount = items.filter(item => item.type === "message").length;
    const functionCallCount = items.filter(item => item.type === "function_call").length;
    
    setCallStats(prev => ({
      ...prev,
      messageCount,
      functionCallCount
    }));
  }, [items]);

  // 통화기록 내보내기 함수
  const handleExportTranscript = () => {
    const transcript = items
      .filter(item => item.type === "message")
      .map(item => {
        const speaker = item.role === "user" ? "어르신" : "AI 어시스턴트";
        const content = item.content?.map(c => c.text).join("") || "";
        const time = item.timestamp || "";
        return `[${time}] ${speaker}: ${content}`;
      })
      .join('\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `통화기록_${callInfo.elderId || 'unknown'}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <ChecklistAndConfig
        ready={allConfigsReady}
        setReady={setAllConfigsReady}
        selectedPhoneNumber={selectedPhoneNumber}
        setSelectedPhoneNumber={setSelectedPhoneNumber}
      />
      <TopBar />
      <div className="flex-grow p-4 h-full overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Column */}
          <div className="col-span-3 flex flex-col gap-4 h-full overflow-hidden">
            <CallStartPanel
              callStatus={callStatus}
              onCallStarted={handleCallStarted}
            />
            <CallStatusPanel
              callInfo={callInfo}
              callQuality={callInfo.status === "active" ? callQuality : undefined}
            />
            <div className="flex-1 overflow-hidden">
              <SessionConfigurationPanel
                callStatus={callStatus}
                onSave={(config) => {
                  if (ws && ws.readyState === WebSocket.OPEN) {
                    const updateEvent = {
                      type: "session.update",
                      session: {
                        ...config,
                      },
                    };
                    console.log("Sending update event:", updateEvent);
                    ws.send(JSON.stringify(updateEvent));
                  }
                }}
              />
            </div>
          </div>

          {/* Middle Column: Transcript */}
          <div className="col-span-6 flex flex-col gap-4 h-full overflow-hidden">
            <PhoneNumberChecklist
              selectedPhoneNumber={selectedPhoneNumber}
              allConfigsReady={allConfigsReady}
              setAllConfigsReady={setAllConfigsReady}
            />
            <Transcript 
              items={items} 
              callStats={callStats}
              onExport={handleExportTranscript}
            />
          </div>

          {/* Right Column: Function Calls */}
          <div className="col-span-3 flex flex-col h-full overflow-hidden">
            <FunctionCallsPanel items={items} ws={ws} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
