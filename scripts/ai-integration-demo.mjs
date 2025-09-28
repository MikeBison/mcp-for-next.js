#!/usr/bin/env node

/**
 * AI集成演示 - 展示MCP如何为AI提供工具能力
 * 模拟AI助手使用MCP工具的场景
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const SERVER_URL = process.argv[2] || "http://localhost:3000";

// 模拟AI助手的对话场景
const aiScenarios = [
  {
    user: "帮我分析一下这个JSON数据",
    data: '{"sales":[{"month":"1月","amount":10000},{"month":"2月","amount":15000},{"month":"3月","amount":12000}]}',
    tools: ["json-format", "calculate", "text-stats"]
  },
  {
    user: "计算一下我的投资收益",
    data: "投资本金: 100000, 年化收益率: 8%, 投资年限: 5年",
    tools: ["calculate", "text-stats"]
  },
  {
    user: "帮我检查系统状态",
    data: "",
    tools: ["system-info", "list-directory"]
  }
];

async function simulateAIAssistant() {
  console.log("🤖 AI助手模拟演示");
  console.log("=" .repeat(60));
  console.log("场景: AI助手通过MCP工具为用户提供服务");
  console.log("=" .repeat(60));

  const transport = new StreamableHTTPClientTransport(new URL(`${SERVER_URL}/mcp`));
  const client = new Client(
    { name: "ai-assistant", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  try {
    await client.connect(transport);
    console.log("✅ AI助手已连接到MCP服务器");

    for (let i = 0; i < aiScenarios.length; i++) {
      const scenario = aiScenarios[i];
      console.log(`\n🎭 场景 ${i + 1}: ${scenario.user}`);
      console.log("-".repeat(40));

      // 模拟AI助手的思考过程
      console.log("🤔 AI助手思考: 用户需要什么工具？");
      
      // 根据场景选择工具
      for (const toolName of scenario.tools) {
        console.log(`\n🔧 调用工具: ${toolName}`);
        
        try {
          let result;
          
          switch (toolName) {
            case "json-format":
              result = await client.callTool({
                name: "json-format",
                arguments: { jsonString: scenario.data }
              });
              console.log("📄 JSON格式化结果:");
              console.log(result.content[0].text);
              break;
              
            case "calculate":
              if (scenario.data.includes("投资")) {
                // 计算复利
                result = await client.callTool({
                  name: "calculate",
                  arguments: { expression: "100000 * Math.pow(1.08, 5)" }
                });
                console.log("💰 投资收益计算结果:");
                console.log(result.content[0].text);
              } else {
                result = await client.callTool({
                  name: "calculate",
                  arguments: { expression: "Math.random() * 100" }
                });
                console.log("🧮 计算结果:");
                console.log(result.content[0].text);
              }
              break;
              
            case "text-stats":
              result = await client.callTool({
                name: "text-stats",
                arguments: { text: scenario.data || "这是AI助手分析的文本内容" }
              });
              console.log("📊 文本分析结果:");
              console.log(result.content[0].text);
              break;
              
            case "system-info":
              result = await client.callTool({
                name: "system-info",
                arguments: {}
              });
              console.log("💻 系统状态:");
              console.log(result.content[0].text);
              break;
              
            case "list-directory":
              result = await client.callTool({
                name: "list-directory",
                arguments: { dirPath: "./" }
              });
              console.log("📁 目录内容:");
              console.log(result.content[0].text);
              break;
          }
          
          // 模拟AI助手的响应
          console.log("💬 AI助手: 工具执行完成，正在分析结果...");
          
        } catch (error) {
          console.log(`❌ 工具 ${toolName} 执行失败:`, error.message);
        }
      }
      
      console.log("\n✨ AI助手: 任务完成！我已经为您处理了所有请求。");
    }

    console.log("\n🎉 AI助手演示完成！");
    console.log("=" .repeat(60));
    console.log("💡 这就是MCP的核心价值：");
    console.log("   - AI模型可以调用外部工具");
    console.log("   - 扩展AI的能力边界");
    console.log("   - 实现AI与业务系统的集成");

  } catch (error) {
    console.error("❌ AI助手连接失败:", error.message);
    console.log("\n🔧 请确保MCP服务器正在运行:");
    console.log("   npm run dev");
  } finally {
    client.close();
  }
}

// 运行AI集成演示
simulateAIAssistant().catch(console.error);
