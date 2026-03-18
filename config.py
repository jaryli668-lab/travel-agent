"""
配置管理模块
"""
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class Config:
    """全局配置"""
    
    # 千问大模型配置
    QIWEN_API_KEY = os.getenv("QIWEN_API_KEY")
    QIWEN_API_BASE = os.getenv("QIWEN_API_BASE", "https://dashscope.aliyuncs.com/compatible-mode/v1")
    QIWEN_MODEL = os.getenv("QIWEN_MODEL", "qwen-max")
    
    # 向量数据库配置
    CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma")
    
    # 知识库配置
    KNOWLEDGE_BASE_DIR = os.getenv("KNOWLEDGE_BASE_DIR", "./data/knowledge")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")
    
    # Agent配置
    MAX_RETRIEVED_DOCS = int(os.getenv("MAX_RETRIEVED_DOCS", "3"))
    SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.7"))
    
    @classmethod
    def validate(cls):
        """验证配置完整性"""
        required_vars = [
            ("QIWEN_API_KEY", cls.QIWEN_API_KEY),
        ]
        
        missing = [name for name, value in required_vars if not value]
        if missing:
            raise ValueError(f"缺少必要的环境变量: {', '.join(missing)}")
        
        return True
