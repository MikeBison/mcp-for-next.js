'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  toolUsed?: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '你好！我是AI助手，我可以通过MCP工具为您执行各种任务。请告诉我您需要什么帮助？',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callMcpTool = async (toolName: string, args: any) => {
    try {
      const response = await fetch('/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args,
          },
        }),
      });

      const data = await response.json();
      return data.result?.content?.[0]?.text || '无结果';
    } catch (error) {
      return `错误: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  };

  const simulateAIResponse = async (userMessage: string) => {
    setLoading(true);
    
    // 模拟AI分析用户意图
    const lowerMessage = userMessage.toLowerCase();
    let toolToUse = '';
    let toolArgs = {};
    let aiResponse = '';

    if (lowerMessage.includes('计算') || lowerMessage.includes('算') || lowerMessage.includes('数学')) {
      toolToUse = 'calculate';
      toolArgs = { expression: '2 + 3 * 4' };
      aiResponse = '我来帮您计算一下...';
    } else if (lowerMessage.includes('json') || lowerMessage.includes('格式化')) {
      toolToUse = 'json-format';
      toolArgs = { jsonString: '{"name":"张三","age":25,"city":"北京"}' };
      aiResponse = '我来格式化这个JSON数据...';
    } else if (lowerMessage.includes('文本') || lowerMessage.includes('统计') || lowerMessage.includes('分析')) {
      toolToUse = 'text-stats';
      toolArgs = { text: '这是一个测试文本，用于分析统计信息。' };
      aiResponse = '我来分析这段文本的统计信息...';
    } else if (lowerMessage.includes('系统') || lowerMessage.includes('状态') || lowerMessage.includes('信息')) {
      toolToUse = 'system-info';
      toolArgs = {};
      aiResponse = '我来检查系统状态...';
    } else if (lowerMessage.includes('回显') || lowerMessage.includes('echo')) {
      toolToUse = 'echo';
      toolArgs = { message: userMessage };
      aiResponse = '我来回显您的消息...';
    } else {
      // 默认使用echo工具
      toolToUse = 'echo';
      toolArgs = { message: userMessage };
      aiResponse = '我收到了您的消息，让我处理一下...';
    }

    // 添加AI思考消息
    const thinkingMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: aiResponse,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, thinkingMessage]);

    // 调用MCP工具
    const toolResult = await callMcpTool(toolToUse, toolArgs);
    
    // 添加工具执行结果
    const resultMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `工具执行结果：\n${toolResult}`,
      timestamp: new Date().toLocaleTimeString(),
      toolUsed: toolToUse,
    };
    setMessages(prev => [...prev, resultMessage]);

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    await simulateAIResponse(inputValue);
  };

  const quickActions = [
    { text: '帮我计算 2 + 3 * 4', icon: '🧮' },
    { text: '格式化这个JSON数据', icon: '📄' },
    { text: '分析文本统计信息', icon: '📊' },
    { text: '检查系统状态', icon: '💻' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
          {/* 头部 */}
          <div className="border-b border-gray-200 p-4">
            <h1 className="text-xl font-semibold text-gray-800">
              🤖 AI助手 (MCP工具集成演示)
            </h1>
            <p className="text-sm text-gray-600">
              体验AI如何通过MCP工具执行实际操作
            </p>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.type === 'system'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.type === 'user' && '👤'}
                    {message.type === 'ai' && '🤖'}
                    {message.type === 'system' && '⚙️'}
                    <span className="text-xs opacity-70">
                      {message.timestamp}
                    </span>
                    {message.toolUsed && (
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        工具: {message.toolUsed}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>AI正在思考...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 快速操作 */}
          <div className="border-t border-gray-200 p-4">
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">快速操作：</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(action.text)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                  >
                    {action.icon} {action.text}
                  </button>
                ))}
              </div>
            </div>

            {/* 输入框 */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入您的消息..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 演示说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 这是AI助手通过MCP工具与用户交互的真实场景</li>
            <li>• AI会根据您的消息自动选择合适的工具</li>
            <li>• 所有工具调用都通过MCP协议执行</li>
            <li>• 这就是未来AI应用的工作方式</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
