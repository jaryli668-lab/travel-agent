# 旅行规划Agent

基于千问大模型和知识库的智能旅行规划助手。

## 功能特性

- 🤖 **智能规划**: 基于千问大模型，自动设计旅行路线
- 📚 **知识库检索**: 使用Chroma向量数据库，检索相关知识
- 🏨 **酒店推荐**: 根据需求和知识，推荐合适的酒店
- 💰 **预算估算**: 提供行程预算估算
- 🎯 **灵活扩展**: 支持自定义知识库和过滤条件
- 🌐 **Web界面**: 美观的图形化界面，无需命令行操作

## 技术架构

```
Web界面 → Flask后端 → TravelAgent → 检索知识库 → 千问大模型 → 行程方案
```

### 技术栈

- **后端框架**: Flask 3.0
- **大模型**: 千问（阿里云）
- **向量数据库**: Chroma
- **嵌入模型**: sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2)
- **前端**: HTML5 + CSS3 + JavaScript (原生)
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

### 方式1：Web界面（推荐）

**启动Web服务：**
```bash
python web_app.py
```

**访问地址：**
```
http://localhost:5000
```

**功能说明：**

#### 1. 行程规划
- 在"行程规划"区域输入旅行需求
- 可选填目的地、预算等筛选条件
- 点击"开始规划"按钮
- 等待AI生成行程方案
- 查看规划结果和使用的知识

#### 2. 知识库管理
- 在"知识库管理"区域输入新的知识
- 点击"添加知识"按钮
- 查看知识库当前状态（文档数量）

### 方式2：命令行

**规划旅行：**
```bash
python main.py plan --input "5个人去三亚3天，预算每人3000元"
```

**带筛选条件：**
```bash
python main.py plan --input "5个人去三亚3天" --destination "三亚" --budget-max 15000
```

**添加知识到知识库：**
```bash
# 添加单条知识
python main.py add-kb --text "三亚天涯海角下午去，看日落最美"

# 从文件批量添加
python main.py add-kb --file data/travel_knowledge.txt
```

**查看知识库信息：**
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
├── templates/               # HTML模板
│   └── index.html         # 主页面
├── static/                 # 静态资源
│   ├── css/
│   │   └── style.css     # 样式文件
│   └── js/
│       └── app.js        # 前端逻辑
├── data/                   # 数据目录
│   ├── chroma/           # 向量数据库存储
│   └── knowledge/         # 知识文档
├── tests/                  # 测试文件
├── docs/                   # 文档
├── main.py                 # 命令行入口
├── web_app.py             # Web应用入口
├── config.py              # 配置管理
├── requirements.txt        # 依赖列表
└── README.md              # 项目说明
```

## 核心模块说明

### 1. Web应用 (web_app.py)
**职责**: Flask后端，提供RESTful API和页面服务

**核心路由**:
- `/`: 首页
- `/plan`: 行程规划API (POST)
- `/add-knowledge`: 添加知识API (POST)
- `/kb-info`: 知识库信息API
- `/health`: 健康检查

### 2. 前端界面 (templates/index.html)
**职责**: 用户交互界面

**特性**:
- 响应式设计（支持桌面和移动端）
- 实时加载状态
- 美观的渐变背景和卡片式布局
- 结果实时展示

### 3. TravelAgent (src/agent.py)
**职责**: 协调知识库和大模型，完成旅行规划

**核心方法**:
- `plan_travel()`: 规划旅行的主流程
- `add_knowledge()`: 添加知识到知识库
- `get_knowledge_base_info()`: 获取知识库信息

### 4. KnowledgeBase (src/knowledge_base.py)
**职责**: 使用Chroma向量数据库管理知识

**核心方法**:
- `add_documents()`: 添加文档并生成嵌入向量
- `search()`: 语义搜索相关知识
- `delete_collection()`: 清空知识库

### 5. QwenClient (src/qiwen_api.py)
**职责**: 调用千问大模型API

**核心方法**:
- `chat_completion()`: 通用聊天补全
- `travel_planning()`: 专用的行程规划函数

## 工作流程

### 行程规划流程

```
1. 用户在Web界面输入需求
   ↓
2. Flask后端接收请求
   ↓
3. 搜索知识库（语义检索）
   ↓
4. 将知识作为上下文
   ↓
5. 调用千问大模型
   ↓
6. 生成行程规划方案
   ↓
7. Web界面展示结果
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

### 4. 高级Web功能

**可添加**:
- 用户登录/注册
- 历史行程记录
- 行程分享功能
- 导出PDF/图片

## 测试

```bash
# 测试知识库
python src/knowledge_base.py

# 测试千问API
python src/qiwen_api.py

# 测试Agent
python src/agent.py

# 启动Web应用
python web_app.py
```

## Web界面特性

### 用户体验
- ✅ 渐变背景，美观大方
- ✅ 卡片式布局，清晰易用
- ✅ 实时加载状态和反馈
- ✅ 响应式设计，支持移动端
- ✅ 无需命令行，图形化操作

### 界面布局
- 左侧：行程规划表单
- 右侧：知识库管理
- 结果区域：实时展示规划结果

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

### 4. Web界面无法访问

**检查**:
- Flask服务是否启动
- 端口5000是否被占用
- 防火墙是否阻止访问

## 许可证

MIT License

## 作者

李成军
- 技术支持: 283903190@qq.com
