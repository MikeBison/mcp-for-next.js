'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  toolUsed?: string;
  reasoning?: string;
}

export default function AIChatWithModel() {
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

  const callAIModel = async (message: string) => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          tools: ['echo', 'calculate', 'json-format', 'text-stats', 'system-info']
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`AI模型调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const simulateAIResponse = async (userMessage: string) => {
    setLoading(true);
    
    try {
      // 调用AI模型API
      const aiResponse = await callAIModel(userMessage);
      
      // 添加AI思考消息
      const thinkingMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse.response.text,
        timestamp: new Date().toLocaleTimeString(),
        reasoning: aiResponse.response.reasoning,
      };
      setMessages(prev => [...prev, thinkingMessage]);

      // 如果AI选择了工具，执行工具
      if (aiResponse.response.tool) {
        const toolResult = await callMcpTool(aiResponse.response.tool, aiResponse.response.args);
        
        // 添加工具执行结果
        const resultMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `工具执行结果：\n${toolResult}`,
          timestamp: new Date().toLocaleTimeString(),
          toolUsed: aiResponse.response.tool,
        };
        setMessages(prev => [...prev, resultMessage]);
      }
      
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `AI处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
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
              🤖 AI助手 (集成AI模型 + MCP工具)
            </h1>
            <p className="text-sm text-gray-600">
              真实AI模型 + MCP工具集成演示
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
                  {message.reasoning && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>AI推理:</strong> {message.reasoning}
                    </div>
                  )}
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

        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ 完整AI集成演示</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 真实AI模型分析用户意图</li>
            <li>• AI自动选择合适的MCP工具</li>
            <li>• 工具执行并返回结果</li>
            <li>• 这就是完整的AI + MCP工作流程</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
