"""
千问大模型API调用模块
"""
import os
from typing import List, Dict, Any
from openai import OpenAI

from config import Config


class QwenClient:
    """千问API客户端"""
    
    def __init__(self):
        """初始化千问客户端"""
        self.client = OpenAI(
            api_key=Config.QIWEN_API_KEY,
            base_url=Config.QIWEN_API_BASE
        )
        self.model = Config.QIWEN_MODEL
        print(f"千问客户端已初始化，模型: {self.model}")
        
    def chat_completion(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: int = 2000) -> str:
        """
        聊天补全
        
        Args:
            messages: 消息列表
            temperature: 温度参数
            max_tokens: 最大token数
            
        Returns:
            响应文本
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"千问API调用失败: {e}")
            raise
            
    def travel_planning(self, user_input: str, knowledge_context: List[str] = None) -> Dict[str, Any]:
        """
        行程规划（专用函数）
        
        Args:
            user_input: 用户输入
            knowledge_context: 知识库上下文
            
        Returns:
            规划结果
        """
        # 构建系统提示词
        system_prompt = """你是一个专业的旅行规划助手。

你的任务：
1. 理解用户的旅行需求（人数、目的地、天数、偏好等）
2. 结合提供的知识库信息，设计合理的旅行路线
3. 推荐合适的酒店
4. 提供预算估算
5. 给出实用建议

输出格式：
- **行程概览**：天数、总预算估算
- **详细路线**：每天的行程安排
- **酒店推荐**：1-3个推荐，包含理由
- **实用建议**：交通、美食、注意事项

如果知识库中没有相关信息，请基于常识给出建议，但要明确说明。
"""
        
        # 构建消息
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # 如果有知识库上下文，添加到消息中
        if knowledge_context:
            context = "\n".join([f"- {doc}" for doc in knowledge_context])
            messages.append({
                "role": "system",
                "content": f"以下是相关的知识库信息：\n{context}\n\n请充分利用这些信息来规划行程。"
            })
        
        # 添加用户输入
        messages.append({
            "role": "user",
            "content": user_input
        })
        
        # 调用千问API
        response = self.chat_completion(messages, temperature=0.7, max_tokens=2000)
        
        return {
            "user_input": user_input,
            "response": response,
            "knowledge_used": knowledge_context or []
        }


# 测试代码
if __name__ == "__main__":
    # 验证配置
    Config.validate()
    
    # 测试千问API
    client = QwenClient()
    
    # 测试行程规划
    result = client.travel_planning("5个人去三亚3天，预算每人3000元")
    print("\n行程规划结果:")
    print(result['response'])
