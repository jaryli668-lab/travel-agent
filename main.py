"""
旅行规划Agent - 命令行入口
"""
import sys
import argparse
from config import Config
from agent import TravelAgent


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="旅行规划Agent")
    subparsers = parser.add_subparsers(dest='command', help='可用命令')
    
    # 规划命令
    plan_parser = subparsers.add_parser('plan', help='规划旅行')
    plan_parser.add_argument('--input', '-i', required=True, help='用户输入（例如：5个人去三亚3天）')
    plan_parser.add_argument('--destination', '-d', help='目的地筛选（例如：三亚）')
    plan_parser.add_argument('--budget-max', help='最大预算筛选')
    
    # 添加知识命令
    add_kb_parser = subparsers.add_parser('add-kb', help='添加知识到知识库')
    add_kb_parser.add_argument('--text', '-t', help='知识文本（单条）')
    add_kb_parser.add_argument('--file', '-f', help='知识文本文件路径（多条）')
    
    # 查看知识库命令
    info_kb_parser = subparsers.add_parser('info-kb', help='查看知识库信息')
    
    # 解析参数
    args = parser.parse_args()
    
    # 验证配置
    try:
        Config.validate()
    except ValueError as e:
        print(f"配置错误: {e}")
        print("\n请参考 .env.example 配置环境变量，然后创建 .env 文件")
        sys.exit(1)
    
    # 创建Agent
    agent = TravelAgent()
    
    # 执行命令
    if args.command == 'plan':
        # 规划旅行
        filters = {}
        if args.destination:
            filters['destination'] = args.destination
        if args.budget_max:
            filters['budget_max'] = int(args.budget_max)
            
        result = agent.plan_travel(args.input, filters)
        print("\n" + "="*60)
        print("行程规划结果")
        print("="*60)
        print(result['travel_plan'])
        
    elif args.command == 'add-kb':
        # 添加知识
        documents = []
        metadatas = []
        
        if args.text:
            documents.append(args.text)
            metadatas.append({'source': 'manual', 'timestamp': 'now'})
            print(f"添加知识: {args.text[:50]}...")
        elif args.file:
            # 从文件读取
            with open(args.file, 'r', encoding='utf-8') as f:
                lines = [line.strip() for line in f.readlines() if line.strip()]
                documents.extend(lines)
                metadatas.extend([{'source': 'file', 'file': args.file}] * len(lines))
            print(f"从文件添加 {len(lines)} 条知识")
        else:
            print("错误: 请提供 --text 或 --file 参数")
            sys.exit(1)
            
        agent.add_knowledge(documents, metadatas)
        print(f"成功添加 {len(documents)} 条知识")
        
    elif args.command == 'info-kb':
        # 查看知识库信息
        info = agent.get_knowledge_base_info()
        print("\n" + "="*60)
        print("知识库信息")
        print("="*60)
        print(f"集合名称: {info['name']}")
        print(f"文档数量: {info['document_count']}")
        
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
