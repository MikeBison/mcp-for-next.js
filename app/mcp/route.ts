import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

// StreamableHttp server
const handler = createMcpHandler(
  async (server) => {
    // 1. 基础工具 - Echo
    server.tool(
      "echo",
      "回显消息工具",
      {
        message: z.string().describe("要回显的消息"),
      },
      async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      }),
    );

    // 2. 文件操作工具
    server.tool(
      "read-file",
      "读取文件内容",
      {
        filePath: z.string().describe("文件路径"),
      },
      async ({ filePath }) => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          return {
            content: [{ 
              type: "text", 
              text: `文件内容 (${filePath}):\n${content}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: `读取文件失败: ${error instanceof Error ? error.message : String(error)}` 
            }],
          };
        }
      },
    );

    server.tool(
      "write-file",
      "写入文件内容",
      {
        filePath: z.string().describe("文件路径"),
        content: z.string().describe("文件内容"),
      },
      async ({ filePath, content }) => {
        try {
          await fs.writeFile(filePath, content, 'utf-8');
          return {
            content: [{ 
              type: "text", 
              text: `文件已成功写入: ${filePath}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: `写入文件失败: ${error instanceof Error ? error.message : String(error)}` 
            }],
          };
        }
      },
    );

    server.tool(
      "list-directory",
      "列出目录内容",
      {
        dirPath: z.string().describe("目录路径"),
      },
      async ({ dirPath }) => {
        try {
          const files = await fs.readdir(dirPath);
          const fileList = files.join('\n');
          return {
            content: [{ 
              type: "text", 
              text: `目录内容 (${dirPath}):\n${fileList}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: `读取目录失败: ${error instanceof Error ? error.message : String(error)}` 
            }],
          };
        }
      },
    );

    // 3. 数据处理工具
    server.tool(
      "json-format",
      "格式化JSON数据",
      {
        jsonString: z.string().describe("JSON字符串"),
      },
      async ({ jsonString }) => {
        try {
          const parsed = JSON.parse(jsonString);
          const formatted = JSON.stringify(parsed, null, 2);
          return {
            content: [{ 
              type: "text", 
              text: `格式化后的JSON:\n${formatted}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: `JSON格式化失败: ${error instanceof Error ? error.message : String(error)}` 
            }],
          };
        }
      },
    );

    server.tool(
      "calculate",
      "执行数学计算",
      {
        expression: z.string().describe("数学表达式，如: 2 + 3 * 4"),
      },
      async ({ expression }) => {
        try {
          // 简单的数学计算（注意：生产环境中需要更安全的计算方式）
          const result = Function(`"use strict"; return (${expression})`)();
          return {
            content: [{ 
              type: "text", 
              text: `${expression} = ${result}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: `计算失败: ${error instanceof Error ? error.message : String(error)}` 
            }],
          };
        }
      },
    );

    // 4. 网络请求工具
    server.tool(
      "fetch-url",
      "获取URL内容",
      {
        url: z.string().url().describe("要获取的URL"),
      },
      async ({ url }) => {
        try {
          const response = await fetch(url);
          const text = await response.text();
          return {
            content: [{ 
              type: "text", 
              text: `URL内容 (${url}):\n${text.substring(0, 1000)}${text.length > 1000 ? '...' : ''}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: `获取URL失败: ${error instanceof Error ? error.message : String(error)}` 
            }],
          };
        }
      },
    );

    // 5. 系统信息工具
    server.tool(
      "system-info",
      "获取系统信息",
      {},
      async () => {
        const info = {
          platform: process.platform,
          nodeVersion: process.version,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          currentTime: new Date().toISOString(),
        };
        
        return {
          content: [{ 
            type: "text", 
            text: `系统信息:\n${JSON.stringify(info, null, 2)}` 
          }],
        };
      },
    );

    // 6. 文本处理工具
    server.tool(
      "text-stats",
      "分析文本统计信息",
      {
        text: z.string().describe("要分析的文本"),
      },
      async ({ text }) => {
        const stats = {
          characters: text.length,
          words: text.split(/\s+/).filter(word => word.length > 0).length,
          lines: text.split('\n').length,
          sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        };
        
        return {
          content: [{ 
            type: "text", 
            text: `文本统计:\n${JSON.stringify(stats, null, 2)}` 
          }],
        };
      },
    );
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "回显消息工具",
        },
        "read-file": {
          description: "读取文件内容",
        },
        "write-file": {
          description: "写入文件内容",
        },
        "list-directory": {
          description: "列出目录内容",
        },
        "json-format": {
          description: "格式化JSON数据",
        },
        calculate: {
          description: "执行数学计算",
        },
        "fetch-url": {
          description: "获取URL内容",
        },
        "system-info": {
          description: "获取系统信息",
        },
        "text-stats": {
          description: "分析文本统计信息",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
