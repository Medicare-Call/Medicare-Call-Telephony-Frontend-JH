export async function POST(request: Request) {
  try {
    const { elderId, phoneNumber, prompt } = await request.json();
    
    // 필수 파라미터 검증
    if (!elderId || !phoneNumber || !prompt) {
      return Response.json(
        { success: false, error: "elderId, phoneNumber, prompt are required" },
        { status: 400 }
      );
    }

    // 백엔드 서버로 통화 시작 요청 전달
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    const response = await fetch(`${backendUrl}/call`, {
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

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { success: false, error: `Backend server error: ${error}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return Response.json(result);
  } catch (error) {
    console.error("Call API error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 