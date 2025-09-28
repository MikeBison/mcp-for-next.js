import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const origin = process.argv[2] || "http://localhost:3000";

async function main() {
  console.log("🚀 启动MCP客户端测试...");
  
  const transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`));
  const client = new Client(
    {
      name: "example-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    }
  );

  try {
    console.log("📡 连接到MCP服务器:", origin);
    await client.connect(transport);
    console.log("✅ 连接成功!");

    // 1. 列出所有可用工具
    console.log("\n📋 获取可用工具列表...");
    const tools = await client.listTools();
    console.log("可用工具:", tools.tools.map(t => `${t.name}: ${t.description}`).join('\n'));

    // 2. 测试基础工具 - Echo
    console.log("\n🔊 测试Echo工具...");
    const echoResult = await client.callTool({
      name: "echo",
      arguments: { message: "Hello MCP World!" }
    });
    console.log("Echo结果:", echoResult.content[0].text);

    // 3. 测试数学计算工具
    console.log("\n🧮 测试数学计算工具...");
    const calcResult = await client.callTool({
      name: "calculate",
      arguments: { expression: "2 + 3 * 4" }
    });
    console.log("计算结果:", calcResult.content[0].text);

    // 4. 测试JSON格式化工具
    console.log("\n📄 测试JSON格式化工具...");
    const jsonResult = await client.callTool({
      name: "json-format",
      arguments: { 
        jsonString: '{"name":"张三","age":25,"hobbies":["读书","游泳","编程"]}' 
      }
    });
    console.log("JSON格式化结果:", jsonResult.content[0].text);

    // 5. 测试文本统计工具
    console.log("\n📊 测试文本统计工具...");
    const textStatsResult = await client.callTool({
      name: "text-stats",
      arguments: { 
        text: "这是一个测试文本。它包含多个句子和单词。让我们看看统计结果如何。" 
      }
    });
    console.log("文本统计结果:", textStatsResult.content[0].text);

    // 6. 测试系统信息工具
    console.log("\n💻 测试系统信息工具...");
    const systemInfoResult = await client.callTool({
      name: "system-info",
      arguments: {}
    });
    console.log("系统信息:", systemInfoResult.content[0].text);

    // 7. 测试网络请求工具（如果网络可用）
    console.log("\n🌐 测试网络请求工具...");
    try {
      const fetchResult = await client.callTool({
        name: "fetch-url",
        arguments: { url: "https://httpbin.org/json" }
      });
      console.log("网络请求结果:", fetchResult.content[0].text);
    } catch (error) {
      console.log("网络请求失败（可能网络不可用）:", error.message);
    }

    // 8. 测试文件操作工具（创建测试文件）
    console.log("\n📁 测试文件操作工具...");
    try {
      // 写入测试文件
      const writeResult = await client.callTool({
        name: "write-file",
        arguments: { 
          filePath: "./test-file.txt",
          content: "这是一个测试文件\n包含多行内容\n用于测试MCP文件操作功能"
        }
      });
      console.log("文件写入结果:", writeResult.content[0].text);

      // 读取测试文件
      const readResult = await client.callTool({
        name: "read-file",
        arguments: { filePath: "./test-file.txt" }
      });
      console.log("文件读取结果:", readResult.content[0].text);

      // 列出当前目录
      const listResult = await client.callTool({
        name: "list-directory",
        arguments: { dirPath: "./" }
      });
      console.log("目录列表结果:", listResult.content[0].text);

    } catch (error) {
      console.log("文件操作失败:", error.message);
    }

    console.log("\n🎉 所有测试完成!");

  } catch (error) {
    console.error("❌ 测试过程中出现错误:", error);
  } finally {
    client.close();
    console.log("🔌 客户端连接已关闭");
  }
}

main().catch(console.error);
