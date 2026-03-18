"""
知识库模块 - 使用Chroma向量数据库
"""
import os
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

from config import Config


class KnowledgeBase:
    """知识库类"""
    
    def __init__(self, collection_name: str = "travel_knowledge"):
        """
        初始化知识库
        
        Args:
            collection_name: 集合名称
        """
        self.collection_name = collection_name
        self.embedding_model = None
        self.client = None
        self.collection = None
        
        self._init_embedding_model()
        self._init_vector_db()
        
    def _init_embedding_model(self):
        """初始化嵌入模型"""
        print(f"加载嵌入模型: {Config.EMBEDDING_MODEL}")
        self.embedding_model = SentenceTransformer(Config.EMBEDDING_MODEL)
        
    def _init_vector_db(self):
        """初始化向量数据库"""
        print(f"初始化向量数据库，存储目录: {Config.CHROMA_PERSIST_DIR}")
        
        # 确保存储目录存在
        os.makedirs(Config.CHROMA_PERSIST_DIR, exist_ok=True)
        
        # 创建Chroma客户端
        self.client = chromadb.PersistentClient(
            path=Config.CHROMA_PERSIST_DIR,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # 获取或创建集合
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}  # 使用余弦相似度
        )
        print(f"集合 '{self.collection_name}' 已就绪")
        
    def add_documents(self, documents: List[str], metadatas: List[Dict[str, Any]] = None, ids: List[str] = None):
        """
        添加文档到知识库
        
        Args:
            documents: 文档内容列表
            metadatas: 元数据列表
            ids: 文档ID列表
        """
        if not documents:
            print("警告: 没有文档需要添加")
            return
            
        # 生成嵌入向量
        print(f"为 {len(documents)} 个文档生成嵌入向量...")
        embeddings = self.embedding_model.encode(documents).tolist()
        
        # 添加到向量数据库
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas or [{}] * len(documents),
            ids=ids or [f"doc_{i}" for i in range(len(documents))]
        )
        
        print(f"成功添加 {len(documents)} 个文档到知识库")
        
    def search(self, query: str, top_k: int = None, where: Dict[str, Any] = None) -> List[Dict]:
        """
        搜索知识库
        
        Args:
            query: 查询文本
            top_k: 返回结果数量
            where: 过滤条件
            
        Returns:
            搜索结果列表
        """
        if top_k is None:
            top_k = Config.MAX_RETRIEVED_DOCS
            
        # 生成查询嵌入
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        # 搜索向量数据库
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            where=where
        )
        
        # 格式化结果
        formatted_results = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                formatted_results.append({
                    "id": results['ids'][0][i],
                    "content": doc,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results['distances'] else 0.0
                })
        
        print(f"搜索 '{query}'，返回 {len(formatted_results)} 个结果")
        return formatted_results
        
    def delete_collection(self):
        """删除当前集合"""
        self.client.delete_collection(name=self.collection_name)
        print(f"集合 '{self.collection_name}' 已删除")
        
    def get_collection_info(self) -> Dict:
        """获取集合信息"""
        count = self.collection.count()
        return {
            "name": self.collection_name,
            "document_count": count
        }


# 测试代码
if __name__ == "__main__":
    # 测试知识库
    kb = KnowledgeBase()
    
    # 添加示例文档
    sample_docs = [
        "三亚旅游攻略：天涯海角是必去景点，建议下午去，看日落",
        "三亚酒店推荐：亚特兰蒂斯适合家庭，希尔顿适合商务",
        "三亚美食：清补凉、海南粉、海鲜火锅是必吃美食",
        "三亚交通：建议租车自驾，景点之间距离较远"
    ]
    
    kb.add_documents(sample_docs)
    
    # 测试搜索
    results = kb.search("三亚有什么好玩的")
    print("\n搜索结果:")
    for result in results:
        print(f"- {result['content']}")
