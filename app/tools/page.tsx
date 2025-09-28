'use client';

import { useState, useEffect } from 'react';

interface Tool {
  name: string;
  description: string;
  parameters: any;
}

interface ToolExecution {
  id: string;
  tool: string;
  args: any;
  result: string;
  timestamp: string;
  status: 'success' | 'error';
}

export default function ToolsManager() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [executions, setExecutions] = useState<ToolExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [customArgs, setCustomArgs] = useState('{}');

  useEffect(() => {
    loadAvailableTools();
  }, []);

  const loadAvailableTools = async () => {
    try {
      const response = await fetch('/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/list',
          params: {},
        }),
      });

      const data = await response.json();
      if (data.result?.tools) {
        setTools(data.result.tools);
      }
    } catch (error) {
      console.error('加载工具失败:', error);
    }
  };

  const executeTool = async (toolName: string, args: any) => {
    setLoading(true);
    const executionId = Date.now().toString();
    
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
      const result = data.result?.content?.[0]?.text || '无结果';
      
      const execution: ToolExecution = {
        id: executionId,
        tool: toolName,
        args,
        result,
        timestamp: new Date().toLocaleTimeString(),
        status: 'success',
      };
      
      setExecutions(prev => [execution, ...prev]);
    } catch (error) {
      const execution: ToolExecution = {
        id: executionId,
        tool: toolName,
        args,
        result: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'error',
      };
      
      setExecutions(prev => [execution, ...prev]);
    }
    
    setLoading(false);
  };

  const getToolArgs = (toolName: string) => {
    const defaultArgs: Record<string, any> = {
      echo: { message: 'Hello MCP!' },
      calculate: { expression: '2 + 3 * 4' },
      'json-format': { jsonString: '{"name":"张三","age":25}' },
      'text-stats': { text: '这是一个测试文本' },
      'system-info': {},
      'read-file': { filePath: './package.json' },
      'write-file': { filePath: './test.txt', content: '测试内容' },
      'list-directory': { dirPath: './' },
      'fetch-url': { url: 'https://httpbin.org/json' },
    };
    
    return defaultArgs[toolName] || {};
  };

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    const defaultArgs = getToolArgs(toolName);
    setCustomArgs(JSON.stringify(defaultArgs, null, 2));
  };

  const handleExecute = () => {
    if (!selectedTool) return;
    
    try {
      const args = JSON.parse(customArgs);
      executeTool(selectedTool, args);
    } catch (error) {
      alert('参数格式错误，请检查JSON格式');
    }
  };

  const predefinedTests = [
    {
      name: '基础测试',
      tests: [
        { tool: 'echo', args: { message: 'Hello World!' } },
        { tool: 'calculate', args: { expression: 'Math.sqrt(16)' } },
        { tool: 'system-info', args: {} },
      ]
    },
    {
      name: '数据处理测试',
      tests: [
        { tool: 'json-format', args: { jsonString: '{"test":true}' } },
        { tool: 'text-stats', args: { text: '测试文本分析功能' } },
      ]
    },
    {
      name: '文件操作测试',
      tests: [
        { tool: 'list-directory', args: { dirPath: './' } },
        { tool: 'write-file', args: { filePath: './test.txt', content: '测试文件内容' } },
        { tool: 'read-file', args: { filePath: './test.txt' } },
      ]
    }
  ];

  const runPredefinedTest = async (tests: any[]) => {
    for (const test of tests) {
      await executeTool(test.tool, test.args);
      await new Promise(resolve => setTimeout(resolve, 500)); // 延迟执行
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🛠️ MCP工具管理器
          </h1>
          <p className="text-gray-600 mb-6">
            管理和测试MCP工具，查看工具执行历史和结果
          </p>

          {/* 可用工具列表 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">可用工具</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTool === tool.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToolSelect(tool.name)}
                >
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 工具执行区域 */}
          {selectedTool && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                执行工具: {selectedTool}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参数配置 (JSON格式)
                </label>
                <textarea
                  value={customArgs}
                  onChange={(e) => setCustomArgs(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="输入JSON参数..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '执行中...' : '执行工具'}
                </button>
                
                <button
                  onClick={() => {
                    const defaultArgs = getToolArgs(selectedTool);
                    setCustomArgs(JSON.stringify(defaultArgs, null, 2));
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  重置参数
                </button>
              </div>
            </div>
          )}

          {/* 预定义测试 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">预定义测试套件</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predefinedTests.map((suite, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{suite.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    包含 {suite.tests.length} 个测试用例
                  </p>
                  <button
                    onClick={() => runPredefinedTest(suite.tests)}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                  >
                    运行测试套件
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 执行历史 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📊 执行历史
          </h2>
          
          {executions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              还没有执行任何工具
            </div>
          ) : (
            <div className="space-y-4">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className={`border rounded-lg p-4 ${
                    execution.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {execution.tool}
                      </h3>
                      <p className="text-sm text-gray-600">
                        参数: {JSON.stringify(execution.args)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {execution.timestamp}
                      </span>
                      <div className={`text-xs px-2 py-1 rounded ${
                        execution.status === 'success'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {execution.status === 'success' ? '成功' : '失败'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {execution.result}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
