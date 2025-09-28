import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, tools } = await request.json();
    
    // 模拟AI模型响应
    const aiResponse = await simulateAIResponse(message, tools);
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      toolsUsed: tools || []
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

async function simulateAIResponse(message: string, tools: string[] = []) {
  // 模拟AI分析用户意图
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('计算') || lowerMessage.includes('算')) {
    return {
      text: "我来帮您计算一下...",
      tool: "calculate",
      args: { expression: "2 + 3 * 4" },
      reasoning: "用户需要数学计算，我选择calculate工具"
    };
  }
  
  if (lowerMessage.includes('json') || lowerMessage.includes('格式化')) {
    return {
      text: "我来格式化这个JSON数据...",
      tool: "json-format", 
      args: { jsonString: '{"name":"张三","age":25}' },
      reasoning: "用户需要JSON处理，我选择json-format工具"
    };
  }
  
  if (lowerMessage.includes('文本') || lowerMessage.includes('统计')) {
    return {
      text: "我来分析这段文本的统计信息...",
      tool: "text-stats",
      args: { text: "这是一个测试文本" },
      reasoning: "用户需要文本分析，我选择text-stats工具"
    };
  }
  
  if (lowerMessage.includes('系统') || lowerMessage.includes('状态')) {
    return {
      text: "我来检查系统状态...",
      tool: "system-info",
      args: {},
      reasoning: "用户需要系统信息，我选择system-info工具"
    };
  }
  
  // 默认回显
  return {
    text: "我收到了您的消息，让我处理一下...",
    tool: "echo",
    args: { message },
    reasoning: "使用echo工具回显用户消息"
  };
}
