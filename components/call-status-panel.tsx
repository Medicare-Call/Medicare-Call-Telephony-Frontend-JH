"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Phone, PhoneCall, PhoneOff, User, Signal } from "lucide-react";
import { CallInfo, CallStatus, CallQuality } from "@/components/types";

interface CallStatusPanelProps {
  callInfo: CallInfo;
  callQuality?: CallQuality;
}

const CallStatusPanel: React.FC<CallStatusPanelProps> = ({ callInfo, callQuality }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [callDuration, setCallDuration] = useState(0);

  // 1초마다 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (callInfo.startTime && callInfo.status === "active") {
        const duration = Math.floor((new Date().getTime() - callInfo.startTime.getTime()) / 1000);
        setCallDuration(duration);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [callInfo.startTime, callInfo.status]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: CallStatus) => {
    const statusConfig = {
      idle: { color: "secondary", icon: PhoneOff, text: "대기중" },
      connecting: { color: "default", icon: Phone, text: "연결중" },
      connected: { color: "default", icon: PhoneCall, text: "연결됨" },
      active: { color: "default", icon: PhoneCall, text: "통화중" },
      ended: { color: "secondary", icon: PhoneOff, text: "종료됨" },
      error: { color: "destructive", icon: PhoneOff, text: "오류" }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getQualityBadge = (quality: string) => {
    const qualityConfig = {
      excellent: { color: "default", text: "최고" },
      good: { color: "default", text: "좋음" },
      fair: { color: "secondary", text: "보통" },
      poor: { color: "destructive", text: "나쁨" }
    };

    const config = qualityConfig[quality as keyof typeof qualityConfig] || qualityConfig.fair;
    
    return (
      <Badge variant={config.color as any}>
        {config.text}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5" />
            통화 상태
          </span>
          {getStatusBadge(callInfo.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 통화 시간 */}
        {(callInfo.status === "active" || callInfo.status === "ended") && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">통화 시간</span>
            </div>
            <div className="text-lg font-mono font-semibold">
              {formatDuration(callDuration)}
            </div>
          </div>
        )}

        {/* 참여자 정보 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">참여자</span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span>노인 ID:</span>
              <span className="font-medium">{callInfo.elderId || "알 수 없음"}</span>
            </div>
            <div className="flex justify-between">
              <span>전화번호:</span>
              <span className="font-medium font-mono">
                {callInfo.phoneNumber || "알 수 없음"}
              </span>
            </div>
          </div>
        </div>

        {/* 세션 정보 */}
        {callInfo.sessionId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Signal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">세션 정보</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded">
              ID: {callInfo.sessionId}
            </div>
          </div>
        )}

        {/* 통화 품질 */}
        {callQuality && callInfo.status === "active" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Signal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">통화 품질</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>연결:</span>
                {getQualityBadge(callQuality.connectionQuality)}
              </div>
              <div className="flex justify-between">
                <span>음성:</span>
                {getQualityBadge(callQuality.audioQuality)}
              </div>
            </div>
            {callQuality.latency && (
              <div className="text-xs text-muted-foreground">
                지연시간: {callQuality.latency}ms
              </div>
            )}
          </div>
        )}

        {/* 통화 시작 시간 */}
        {callInfo.startTime && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            시작: {callInfo.startTime.toLocaleString('ko-KR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CallStatusPanel; 