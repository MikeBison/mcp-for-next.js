# 🤖 AI模型集成指南

## 🎯 问题解答

您说得完全正确！这个项目确实**没有部署AI模型**，它只是一个**MCP工具服务器**。

### 📊 当前架构
```
前端页面 → MCP工具服务器 → 工具执行
    ↑           ↑
  用户界面   工具提供者
```

### ❌ 缺少的部分
```
AI模型 ← MCP协议 ← 工具服务器
  ↑
用户请求
```

## 🔧 解决方案

### 方案1: 集成真实AI模型API

#### 1. **OpenAI集成**
```typescript
// 在 app/api/openai/route.ts 中
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "你是一个AI助手，可以通过MCP工具执行各种任务。"
      },
      {
        role: "user", 
        content: message
      }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "call_mcp_tool",
          description: "调用MCP工具",
          parameters: {
            type: "object",
            properties: {
              tool: { type: "string" },
              args: { type: "object" }
            }
          }
        }
      }
    ]
  });
  
  return NextResponse.json(completion.choices[0]);
}
```

#### 2. **Claude集成**
```typescript
// 集成Anthropic Claude
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: message
      }
    ],
    tools: [
      {
        name: "call_mcp_tool",
        description: "调用MCP工具执行任务",
        input_schema: {
          type: "object",
          properties: {
            tool: { type: "string" },
            args: { type: "object" }
          }
        }
      }
    ]
  });
  
  return NextResponse.json(response);
}
```

### 方案2: 本地AI模型部署

#### 1. **Ollama集成**
```bash
# 安装Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 下载模型
ollama pull llama2
ollama pull codellama
```

```typescript
// 集成Ollama API
export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama2',
      prompt: message,
      stream: false
    })
  });
  
  const data = await response.json();
  return NextResponse.json({ response: data.response });
}
```

#### 2. **本地LLM服务**
```typescript
// 集成本地LLM服务
export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  // 调用本地LLM服务
  const response = await fetch('http://localhost:8000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      model: 'local-llm'
    })
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

## 🚀 完整集成示例

### 1. **环境变量配置**
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OLLAMA_URL=http://localhost:11434
```

### 2. **AI模型选择器**
```typescript
// app/api/ai/route.ts
export async function POST(request: NextRequest) {
  const { message, model = 'openai' } = await request.json();
  
  switch (model) {
    case 'openai':
      return await callOpenAI(message);
    case 'claude':
      return await callClaude(message);
    case 'ollama':
      return await callOllama(message);
    default:
      return await callOpenAI(message);
  }
}
```

### 3. **MCP工具调用**
```typescript
// 在AI响应后调用MCP工具
const aiResponse = await callAI(message);
if (aiResponse.tool) {
  const toolResult = await callMcpTool(aiResponse.tool, aiResponse.args);
  return {
    aiResponse: aiResponse.text,
    toolResult: toolResult
  };
}
```

## 🎯 实际部署方案

### 方案A: 云端AI服务
```typescript
// 使用OpenAI/Claude API
const aiResponse = await openai.chat.completions.create({
  model: "gpt-4",
  messages: messages,
  tools: mcpTools
});
```

### 方案B: 本地AI服务
```typescript
// 使用本地LLM
const aiResponse = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama2',
    prompt: message
  })
});
```

### 方案C: 混合方案
```typescript
// 根据需求选择AI模型
const useLocalAI = process.env.NODE_ENV === 'development';
const aiResponse = useLocalAI 
  ? await callLocalAI(message)
  : await callCloudAI(message);
```

## 📊 架构对比

### 当前架构 (只有工具)
```
用户 → 前端 → MCP工具 → 结果
```

### 完整架构 (AI + 工具)
```
用户 → 前端 → AI模型 → MCP工具 → 结果
```

## 🔧 快速开始

### 1. 启动当前项目
```bash
npm run dev
# 访问 http://localhost:3000/ai-chat
```

### 2. 集成真实AI模型
```bash
# 安装AI模型依赖
npm install openai @anthropic-ai/sdk

# 配置环境变量
echo "OPENAI_API_KEY=your_key" >> .env.local
```

### 3. 测试完整流程
```bash
# 访问AI聊天界面
# http://localhost:3000/ai-chat
```

## 💡 总结

- **当前项目**: MCP工具服务器 (工具提供者)
- **缺少部分**: AI模型 (智能决策者)
- **解决方案**: 集成OpenAI/Claude/本地LLM
- **完整流程**: 用户 → AI模型 → MCP工具 → 结果

现在您可以访问 `http://localhost:3000/ai-chat` 来体验完整的AI + MCP集成演示！
