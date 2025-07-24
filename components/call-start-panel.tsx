"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Phone } from "lucide-react";

interface CallStartPanelProps {
  callStatus: string;
  onCallStarted?: (sessionData: any) => void;
}

const CallStartPanel: React.FC<CallStartPanelProps> = ({
  callStatus,
  onCallStarted,
}) => {
  const [elderId, setElderId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [prompt, setPrompt] = useState(
    "안녕하세요, 어르신. 저는 Medicare 건강 관리 도우미입니다. 오늘 컨디션은 어떠신지 여쭤보고 싶어서 연락드렸습니다."
  );
  const [isStarting, setIsStarting] = useState(false);
  const [lastCallResult, setLastCallResult] = useState<any>(null);

  const handleStartCall = async () => {
    if (!elderId || !phoneNumber || !prompt) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsStarting(true);
    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          elderId,
          phoneNumber,
          prompt,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setLastCallResult(result);
        onCallStarted?.(result);
        console.log("통화 시작됨:", result);
      } else {
        alert(`통화 시작 실패: ${result.error}`);
      }
    } catch (error) {
      console.error("통화 시작 오류:", error);
      alert("통화 시작 중 오류가 발생했습니다.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          통화 시작
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="elderId">노인 ID</Label>
            <Input
              id="elderId"
              value={elderId}
              onChange={(e) => setElderId(e.target.value)}
              placeholder="예: elder_001"
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">전화번호</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="예: +821012345678"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="prompt">초기 프롬프트</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="AI가 통화 시작시 말할 내용을 입력하세요"
          />
        </div>

        <Button
          onClick={handleStartCall}
          disabled={isStarting || callStatus === "connected"}
          className="w-full"
        >
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              통화 시작 중...
            </>
          ) : (
            <>
              <Phone className="mr-2 h-4 w-4" />
              통화 시작
            </>
          )}
        </Button>

        {lastCallResult && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>통화 시작됨:</strong>
            </p>
            <p className="text-xs text-green-600 mt-1">
              Session ID: {lastCallResult.sessionId}
            </p>
            <p className="text-xs text-green-600">
              Call SID: {lastCallResult.callSid}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CallStartPanel; 