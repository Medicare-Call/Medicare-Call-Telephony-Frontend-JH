import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Phone, MessageSquare, Wrench, Download, Search, Filter } from "lucide-react";
import { Item, CallStats } from "@/components/types";

type TranscriptProps = {
  items: Item[];
  callStats?: CallStats;
  onExport?: () => void;
};

const Transcript: React.FC<TranscriptProps> = ({ items, callStats, onExport }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  // Show messages, function calls, and function call outputs in the transcript
  const transcriptItems = items.filter(
    (it) =>
      it.type === "message" ||
      it.type === "function_call" ||
      it.type === "function_call_output"
  );

  // 검색 필터링
  const filteredItems = searchQuery 
    ? transcriptItems.filter(item => {
        const content = item.content ? item.content.map(c => c.text).join("").toLowerCase() : "";
        const name = item.name?.toLowerCase() || "";
        return content.includes(searchQuery.toLowerCase()) || name.includes(searchQuery.toLowerCase());
      })
    : transcriptItems;

  // 발화자별 색상 구분
  const getSpeakerColor = (role?: string) => {
    switch (role) {
      case "user":
        return "bg-blue-50 border-blue-200";
      case "assistant":
        return "bg-green-50 border-green-200";
      case "tool":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // 시간 포맷팅 개선
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    const now = new Date();
    const msgTime = new Date(timestamp);
    const diff = now.getTime() - msgTime.getTime();
    
    if (diff < 60000) { // 1분 미만
      return "방금 전";
    } else if (diff < 3600000) { // 1시간 미만
      return `${Math.floor(diff / 60000)}분 전`;
    } else {
      return timestamp;
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            실시간 통화기록
            {transcriptItems.length > 0 && (
              <Badge variant="secondary">{transcriptItems.length}개 메시지</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-1" />
                내보내기
              </Button>
            )}
            {callStats && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowStats(!showStats)}
              >
                <Filter className="w-4 h-4 mr-1" />
                통계
              </Button>
            )}
          </div>
        </div>
        
        {/* 검색 바 */}
        {transcriptItems.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="대화 내용 검색..."
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-md bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* 통계 정보 */}
        {showStats && callStats && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-md text-sm">
            <div>
              <div className="font-medium">메시지: {callStats.messageCount}개</div>
              <div className="text-muted-foreground">함수 호출: {callStats.functionCallCount}개</div>
            </div>
            <div>
              <div className="font-medium">평균 응답: {callStats.avgResponseTime}ms</div>
              <div className="text-muted-foreground">총 대화: {Math.floor(callStats.totalSpeechTime)}초</div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 h-full min-h-0 overflow-hidden flex flex-col p-0">
        {filteredItems.length === 0 && transcriptItems.length === 0 && (
          <div className="flex flex-1 h-full items-center justify-center mt-36">
            <div className="flex flex-col items-center gap-3 justify-center h-full">
              <div className="h-[140px] w-[140px] rounded-full bg-secondary/20 flex items-center justify-center">
                <MessageSquare className="h-16 w-16 text-foreground/10 bg-transparent" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground/60">
                  No messages yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Start a call to see the transcript
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 검색 결과가 없을 때 */}
        {filteredItems.length === 0 && transcriptItems.length > 0 && (
          <div className="flex flex-1 h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 justify-center h-full">
              <Search className="h-12 w-12 text-muted-foreground" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground/60">
                  검색 결과가 없습니다
                </p>
                <p className="text-sm text-muted-foreground">
                  다른 키워드로 시도해보세요
                </p>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-6">
            {filteredItems.map((msg, i) => {
              const isUser = msg.role === "user";
              const isTool = msg.role === "tool";
              // Default to assistant if not user or tool
              const Icon = isUser ? Phone : isTool ? Wrench : Bot;

              // Combine all text parts into a single string for display
              const displayText = msg.content
                ? msg.content.map((c) => c.text).join("")
                : "";

              return (
                <div key={i} className={`border rounded-lg p-4 ${getSpeakerColor(msg.role)}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isUser
                          ? "bg-blue-100 border-blue-300"
                          : isTool
                          ? "bg-orange-100 border-orange-300"
                          : "bg-green-100 border-green-300"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {isUser
                              ? "어르신"
                              : isTool
                              ? "시스템"
                              : "AI 어시스턴트"}
                          </span>
                          {msg.status === "running" && (
                            <Badge variant="outline" className="text-xs">
                              입력중...
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                      
                      {/* 함수 호출의 경우 특별한 표시 */}
                      {msg.type === "function_call" && (
                        <div className="mb-2">
                          <Badge variant="secondary" className="text-xs">
                            함수 호출: {msg.name}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="text-sm leading-relaxed break-words">
                        {displayText && (
                          <p className={isUser ? "font-medium" : ""}>
                            {displayText}
                          </p>
                        )}
                        
                        {/* 함수 호출 매개변수 표시 */}
                        {msg.type === "function_call" && msg.arguments && (
                          <div className="mt-2 p-2 bg-black/5 rounded text-xs font-mono">
                            매개변수: {msg.arguments}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Transcript;
