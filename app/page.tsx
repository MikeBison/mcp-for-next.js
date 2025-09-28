'use client';

import { useState } from 'react';

interface ToolResult {
  tool: string;
  result: string;
  timestamp: string;
}

export default function MCPDemo() {
  const [results, setResults] = useState<ToolResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

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

  const handleToolCall = async (toolName: string, args: any, description: string) => {
    setLoading(true);
    const result = await callMcpTool(toolName, args);
    const newResult: ToolResult = {
      tool: description,
      result,
      timestamp: new Date().toLocaleTimeString(),
    };
    setResults(prev => [newResult, ...prev]);
    setLoading(false);
  };

  const tools = [
    {
      name: 'echo',
      description: '回显消息',
      args: { message: inputValue || 'Hello MCP!' },
      getArgs: () => ({ message: inputValue || 'Hello MCP!' }),
    },
    {
      name: 'calculate',
      description: '数学计算',
      args: { expression: '2 + 3 * 4' },
      getArgs: () => ({ expression: inputValue || '2 + 3 * 4' }),
    },
    {
      name: 'json-format',
      description: 'JSON格式化',
      args: { jsonString: '{"name":"张三","age":25}' },
      getArgs: () => ({ jsonString: inputValue || '{"name":"张三","age":25}' }),
    },
    {
      name: 'text-stats',
      description: '文本统计',
      args: { text: '这是一个测试文本' },
      getArgs: () => ({ text: inputValue || '这是一个测试文本' }),
    },
    {
      name: 'system-info',
      description: '系统信息',
      args: {},
      getArgs: () => ({}),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🤖 MCP工具演示平台
          </h1>
          <p className="text-gray-600 mb-6">
            通过Web界面体验MCP工具的强大功能，让AI助手能够执行实际操作
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义输入 (可选)
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入自定义参数..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {tools.map((tool, index) => (
              <button
                key={index}
                onClick={() => handleToolCall(tool.name, tool.getArgs(), tool.description)}
                disabled={loading}
                className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-blue-800 mb-1">
                    {tool.description}
                  </h3>
                  <p className="text-sm text-blue-600">
                    工具: {tool.name}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">正在执行工具...</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📊 执行结果
          </h2>
          
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              点击上方按钮开始体验MCP工具
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {result.tool}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {result.timestamp}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {result.result}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 点击任意工具按钮即可执行对应的MCP工具</li>
            <li>• 在输入框中输入自定义参数，工具会使用您的输入</li>
            <li>• 所有工具都通过MCP协议与Next.js服务器通信</li>
            <li>• 这就是AI助手调用工具的真实场景</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
