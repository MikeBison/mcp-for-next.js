#!/usr/bin/env node

/**
 * MCP快速演示脚本
 * 展示如何使用各种MCP工具
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const SERVER_URL = process.argv[2] || "http://localhost:3000";

async function demoMcpTools() {
  console.log("🎯 MCP工具演示开始");
  console.log("=" .repeat(50));

  const transport = new StreamableHTTPClientTransport(new URL(`${SERVER_URL}/mcp`));
  const client = new Client(
    { name: "demo-client", version: "1.0.0" },
    { capabilities: { prompts: {}, resources: {}, tools: {} } }
  );

  try {
    await client.connect(transport);
    console.log("✅ 已连接到MCP服务器");

    // 演示1: 基础工具
    console.log("\n📢 演示1: Echo工具");
    const echoResult = await client.callTool({
      name: "echo",
      arguments: { message: "Hello MCP!" }
    });
    console.log("结果:", echoResult.content[0].text);

    // 演示2: 数学计算
    console.log("\n🧮 演示2: 数学计算");
    const calcResult = await client.callTool({
      name: "calculate",
      arguments: { expression: "Math.sqrt(16) + Math.pow(2, 3)" }
    });
    console.log("结果:", calcResult.content[0].text);

    // 演示3: JSON处理
    console.log("\n📄 演示3: JSON格式化");
    const jsonData = {
      name: "张三",
      age: 30,
      skills: ["JavaScript", "TypeScript", "Node.js"],
      address: {
        city: "北京",
        country: "中国"
      }
    };
    
    const jsonResult = await client.callTool({
      name: "json-format",
      arguments: { jsonString: JSON.stringify(jsonData) }
    });
    console.log("结果:", jsonResult.content[0].text);

    // 演示4: 文本分析
    console.log("\n📊 演示4: 文本统计分析");
    const sampleText = `
      人工智能（AI）是计算机科学的一个分支，它企图了解智能的实质，
      并生产出一种新的能以人类智能相似的方式做出反应的智能机器。
      该领域的研究包括机器人、语言识别、图像识别、自然语言处理和专家系统等。
    `;
    
    const textStatsResult = await client.callTool({
      name: "text-stats",
      arguments: { text: sampleText }
    });
    console.log("结果:", textStatsResult.content[0].text);

    // 演示5: 系统信息
    console.log("\n💻 演示5: 系统信息");
    const systemResult = await client.callTool({
      name: "system-info",
      arguments: {}
    });
    console.log("结果:", systemResult.content[0].text);

    console.log("\n🎉 演示完成！");
    console.log("=" .repeat(50));
    console.log("💡 提示: 查看 EXAMPLES.md 了解更多工具用法");

  } catch (error) {
    console.error("❌ 演示过程中出现错误:", error.message);
    console.log("\n🔧 请确保:");
    console.log("1. MCP服务器正在运行 (npm run dev)");
    console.log("2. 服务器地址正确:", SERVER_URL);
  } finally {
    client.close();
  }
}

// 运行演示
demoMcpTools().catch(console.error);
