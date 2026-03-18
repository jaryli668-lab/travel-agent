# 旅行规划Agent

基于千问大模型和知识库的智能旅行规划助手。

## 功能特性

- 🤖 **智能规划**: 基于千问大模型，自动设计旅行路线
- 📚 **知识库检索**: 使用Chroma向量数据库，检索相关知识
- 🏨 **酒店推荐**: 根据需求和知识，推荐合适的酒店
- 💰 **预算估算**: 提供行程预算估算
- 🎯 **灵活扩展**: 支持自定义知识库和过滤条件

## 技术架构

```
用户输入 → TravelAgent → 检索知识库 → 千问大模型 → 行程方案
```

### 技术栈

- **大模型**: 千问（阿里云）
- **向量数据库**: Chroma
- **嵌入模型**: sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2)
- **语言**: Python 3.8+

## 安装

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

复制配置模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的千问API密钥：
```env
QIWEN_API_KEY=your_qiwen_api_key_here
QIWEN_API_BASE=https://dashscope.aliyuncs.com/compatible-mode/v1
QIWEN_MODEL=qwen-max

# 向量数据库配置
CHROMA_PERSIST_DIR=./data/chroma

# 知识库配置
KNOWLEDGE_BASE_DIR=./data/knowledge
EMBEDDING_MODEL=paraphrase-multilingual-MiniLM-L12-v2

# Agent配置
MAX_RETRIEVED_DOCS=3
SIMILARITY_THRESHOLD=0.7
```

## 使用方法

### 1. 规划旅行

```bash
python main.py plan --input "5个人去三亚3天，预算每人3000元"
```

带筛选条件：
```bash
python main.py plan --input "5个人去三亚3天" --destination "三亚" --budget-max 15000
```

### 2. 添加知识到知识库

**添加单条知识：**
```bash
python main.py add-kb --text "三亚天涯海角下午去，看日落最美"
```

**从文件批量添加：**
```bash
python main.py add-kb --file data/travel_knowledge.txt
```

知识文件格式（每行一条）：
```
三亚旅游攻略：天涯海角是必去景点，建议下午去，看日落
三亚酒店推荐：亚特兰蒂斯适合家庭，希尔顿适合商务
三亚美食：清补凉、海南粉、海鲜火锅是必吃美食
三亚交通：建议租车自驾，景点之间距离较远
```

### 3. 查看知识库信息

```bash
python main.py info-kb
```

输出：
```
============================================================
知识库信息
============================================================
集合名称: travel_knowledge
文档数量: 4
```

## 项目结构

```
travel-agent/
├── src/                    # 源代码
│   ├── __init__.py
│   ├── agent.py            # Agent主逻辑
│   ├── knowledge_base.py   # 知识库模块
│   └── qiwen_api.py       # 千问API调用
├── data/                   # 数据目录
│   ├── chroma/           # 向量数据库存储
│   └── knowledge/         # 知识文档
├── tests/                  # 测试文件
├── docs/                   # 文档
├── main.py                 # 命令行入口
├── config.py              # 配置管理
├── requirements.txt        # 依赖列表
└── README.md              # 项目说明
```

## 核心模块说明

### 1. TravelAgent (src/agent.py)
**职责**: 协调知识库和大模型，完成旅行规划

**核心方法**:
- `plan_travel()`: 规划旅行的主流程
- `add_knowledge()`: 添加知识到知识库
- `get_knowledge_base_info()`: 获取知识库信息

### 2. KnowledgeBase (src/knowledge_base.py)
**职责**: 使用Chroma向量数据库管理知识

**核心方法**:
- `add_documents()`: 添加文档并生成嵌入向量
- `search()`: 语义搜索相关知识
- `delete_collection()`: 清空知识库

### 3. QwenClient (src/qiwen_api.py)
**职责**: 调用千问大模型API

**核心方法**:
- `chat_completion()`: 通用聊天补全
- `travel_planning()`: 专用的行程规划函数

## 工作流程

### 行程规划流程

```
1. 用户输入需求
   ↓
2. 搜索知识库（语义检索）
   ↓
3. 将知识作为上下文
   ↓
4. 调用千问大模型
   ↓
5. 生成行程规划方案
```

### 知识库更新流程

```
1. 业务系统提供数据标签
   ↓
2. 数据清洗和格式化
   ↓
3. 生成嵌入向量
   ↓
4. 存入向量数据库
```

## 扩展方向

### 1. 集成业务系统

**对接方式**: 通过API或数据库
**数据来源**: 
- 用户历史行程
- 用户偏好标签
- 酒店数据库
- 景点数据库

### 2. 增强知识库

**数据来源**:
- 旅游攻略网站
- 官方旅游信息
- 用户生成内容
- 实时数据（天气、交通）

### 3. 多模态支持

**扩展能力**:
- 图片识别（景点照片）
- 地图集成（路线可视化）
- 实时预订（酒店、机票）

## 测试

```bash
# 测试知识库
python src/knowledge_base.py

# 测试千问API
python src/qiwen_api.py

# 测试Agent
python src/agent.py
```

## 常见问题

### 1. 千问API调用失败

**检查**:
- API密钥是否正确
- 网络连接是否正常
- API endpoint是否正确

### 2. 知识库检索无结果

**检查**:
- 知识库是否有数据
- 查询关键词是否匹配
- 相似度阈值是否过高

### 3. 生成的行程不合理

**检查**:
- 知识库信息是否准确
- 提示词是否清晰
- 模型版本是否合适

## 许可证

MIT License

## 作者

李成军
- 技术支持: 283903190@qq.com
