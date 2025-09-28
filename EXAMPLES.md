# MCP工具使用示例

这个文档展示了如何在MCP服务器中使用各种工具。

## 🚀 快速开始

### 1. 启动服务器
```bash
npm run dev
# 或
pnpm dev
```

### 2. 运行测试示例
```bash
node scripts/test-examples.mjs
```

## 🛠️ 可用工具列表

### 1. 基础工具

#### `echo` - 回显消息
```javascript
await client.callTool({
  name: "echo",
  arguments: { message: "Hello World!" }
});
```

### 2. 文件操作工具

#### `read-file` - 读取文件
```javascript
await client.callTool({
  name: "read-file",
  arguments: { filePath: "./package.json" }
});
```

#### `write-file` - 写入文件
```javascript
await client.callTool({
  name: "write-file",
  arguments: { 
    filePath: "./output.txt",
    content: "文件内容"
  }
});
```

#### `list-directory` - 列出目录
```javascript
await client.callTool({
  name: "list-directory",
  arguments: { dirPath: "./" }
});
```

### 3. 数据处理工具

#### `json-format` - JSON格式化
```javascript
await client.callTool({
  name: "json-format",
  arguments: { 
    jsonString: '{"name":"张三","age":25}' 
  }
});
```

#### `calculate` - 数学计算
```javascript
await client.callTool({
  name: "calculate",
  arguments: { expression: "2 + 3 * 4" }
});
```

### 4. 网络工具

#### `fetch-url` - 获取URL内容
```javascript
await client.callTool({
  name: "fetch-url",
  arguments: { url: "https://api.github.com/users/octocat" }
});
```

### 5. 系统工具

#### `system-info` - 系统信息
```javascript
await client.callTool({
  name: "system-info",
  arguments: {}
});
```

#### `text-stats` - 文本统计
```javascript
await client.callTool({
  name: "text-stats",
  arguments: { 
    text: "要分析的文本内容" 
  }
});
```

## 📝 使用场景示例

### 场景1: 文件处理工作流
```javascript
// 1. 读取配置文件
const config = await client.callTool({
  name: "read-file",
  arguments: { filePath: "./config.json" }
});

// 2. 格式化JSON
const formatted = await client.callTool({
  name: "json-format",
  arguments: { jsonString: config.content[0].text }
});

// 3. 写入格式化后的文件
await client.callTool({
  name: "write-file",
  arguments: { 
    filePath: "./config-formatted.json",
    content: formatted.content[0].text
  }
});
```

### 场景2: 数据分析工作流
```javascript
// 1. 获取数据
const data = await client.callTool({
  name: "fetch-url",
  arguments: { url: "https://api.example.com/data" }
});

// 2. 分析文本统计
const stats = await client.callTool({
  name: "text-stats",
  arguments: { text: data.content[0].text }
});

// 3. 计算处理结果
const result = await client.callTool({
  name: "calculate",
  arguments: { expression: "100 * 0.85" }
});
```

### 场景3: 系统监控
```javascript
// 1. 获取系统信息
const systemInfo = await client.callTool({
  name: "system-info",
  arguments: {}
});

// 2. 检查目录内容
const dirContents = await client.callTool({
  name: "list-directory",
  arguments: { dirPath: "./logs" }
});

// 3. 分析日志文件
const logStats = await client.callTool({
  name: "text-stats",
  arguments: { text: logContent }
});
```

## 🔧 自定义工具开发

### 添加新工具
在 `app/mcp/route.ts` 中添加新的工具：

```typescript
server.tool(
  "my-custom-tool",
  "我的自定义工具",
  {
    param1: z.string().describe("参数1描述"),
    param2: z.number().describe("参数2描述"),
  },
  async ({ param1, param2 }) => {
    // 工具逻辑
    const result = `处理结果: ${param1} + ${param2}`;
    
    return {
      content: [{ 
        type: "text", 
        text: result 
      }],
    };
  },
);
```

### 工具参数验证
使用Zod进行参数验证：

```typescript
{
  // 字符串参数
  name: z.string().min(1).max(100),
  
  // 数字参数
  age: z.number().min(0).max(120),
  
  // 邮箱参数
  email: z.string().email(),
  
  // URL参数
  website: z.string().url(),
  
  // 可选参数
  description: z.string().optional(),
  
  // 枚举参数
  status: z.enum(["active", "inactive", "pending"]),
}
```

## 🚨 注意事项

1. **安全性**: 文件操作工具在生产环境中需要适当的权限控制
2. **网络请求**: 确保目标URL是可信的
3. **计算工具**: 避免执行不安全的代码
4. **错误处理**: 所有工具都包含错误处理机制
5. **资源限制**: 注意文件大小和网络请求的超时设置

## 🎯 最佳实践

1. **参数验证**: 始终使用Zod进行参数验证
2. **错误处理**: 提供有意义的错误信息
3. **日志记录**: 使用verboseLogs进行调试
4. **资源清理**: 及时关闭连接和清理资源
5. **测试覆盖**: 为每个工具编写测试用例
