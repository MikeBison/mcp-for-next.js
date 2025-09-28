import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'MCP工具演示平台',
  description: '体验MCP工具的强大功能',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-xl font-bold">
                  🤖 MCP演示平台
                </Link>
                <div className="hidden md:flex space-x-6">
                  <Link 
                    href="/" 
                    className="hover:text-blue-200 transition-colors"
                  >
                    🏠 首页
                  </Link>
                  <Link 
                    href="/chat" 
                    className="hover:text-blue-200 transition-colors"
                  >
                    💬 模拟聊天
                  </Link>
                  <Link 
                    href="/ai-chat" 
                    className="hover:text-blue-200 transition-colors"
                  >
                    🤖 AI聊天
                  </Link>
                  <Link 
                    href="/tools" 
                    className="hover:text-blue-200 transition-colors"
                  >
                    🛠️ 工具管理
                  </Link>
                </div>
              </div>
              <div className="text-sm">
                <span className="bg-blue-500 px-2 py-1 rounded">
                  MCP协议演示
                </span>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
