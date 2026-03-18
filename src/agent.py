"""
旅行规划Agent主逻辑
"""
from typing import Dict, Any
from .knowledge_base import KnowledgeBase
from .qiwen_api import QwenClient


class TravelAgent:
    """旅行规划Agent"""
    
    def __init__(self):
        """初始化Agent"""
        self.knowledge_base = KnowledgeBase()
        self.qwen_client = QwenClient()
        print("旅行规划Agent已初始化")
        
    def plan_travel(self, user_input: str, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        规划旅行
        
        Args:
            user_input: 用户输入（例如：5个人去三亚3天）
            filters: 知识库过滤条件（例如：目的地、预算范围）
            
        Returns:
            规划结果
        """
        print(f"\n{'='*60}")
        print(f"收到旅行规划请求")
        print(f"用户输入: {user_input}")
        print(f"{'='*60}\n")
        
        # 步骤1: 搜索知识库
        print("步骤1: 搜索知识库...")
        knowledge_results = self.knowledge_base.search(
            query=user_input,
            where=filters
        )
        
        # 提取知识内容
        knowledge_context = [result['content'] for result in knowledge_results]
        
        print(f"从知识库检索到 {len(knowledge_context)} 条相关信息")
        if knowledge_context:
            for i, context in enumerate(knowledge_context, 1):
                print(f"  {i}. {context[:100]}...")
        else:
            print("  没有检索到相关知识")
        
        # 步骤2: 调用千问大模型规划
        print("\n步骤2: 调用千问大模型规划行程...")
        planning_result = self.qwen_client.travel_planning(
            user_input=user_input,
            knowledge_context=knowledge_context
        )
        
        # 步骤3: 格式化结果
        print("\n步骤3: 格式化规划结果...")
        formatted_result = {
            "user_input": user_input,
            "knowledge_retrieved": {
                "count": len(knowledge_context),
                "items": knowledge_context
            },
            "travel_plan": planning_result['response'],
            "metadata": {
                "knowledge_base_info": self.knowledge_base.get_collection_info()
            }
        }
        
        print("\n行程规划完成！")
        print(f"{'='*60}\n")
        
        return formatted_result
        
    def add_knowledge(self, documents: list, metadatas: list = None):
        """
        添加知识到知识库
        
        Args:
            documents: 文档列表
            metadatas: 元数据列表
        """
        self.knowledge_base.add_documents(documents, metadatas)
        
    def get_knowledge_base_info(self) -> Dict[str, Any]:
        """
        获取知识库信息
        
        Returns:
            知识库信息
        """
        return self.knowledge_base.get_collection_info()


# 测试代码
if __name__ == "__main__":
    from config import Config
    
    # 验证配置
    Config.validate()
    
    # 测试Agent
    agent = TravelAgent()
    
    # 测试规划
    result = agent.plan_travel("5个人去三亚3天，预算每人3000元")
    print("\n最终结果:")
    print(result['travel_plan'])
