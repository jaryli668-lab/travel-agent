# 安装依赖说明

## 方法1：虚拟环境安装（推荐）

如果你的环境支持虚拟环境：

```bash
cd travel-agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install sentence-transformers
```

## 方法2：系统级安装（需要sudo）

如果使用Debian/Ubuntu，可能需要sudo：

```bash
sudo apt install python3.11-venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install sentence-transformers
```

## 方法3：使用pipx（全局安装）

```bash
pipx install sentence-transformers
```

## 验证安装

```bash
python3 -c "import sentence_transformers; print('安装成功')"
```

## 如果安装失败

### 选项A：使用OpenAI嵌入API

我可以修改代码，使用OpenAI的嵌入API代替本地嵌入模型。
- 需要：OpenAI API key
- 优势：无需本地安装

### 选项B：简化知识库

我可以创建一个简化的知识库实现：
- 使用关键词匹配
- 不需要向量嵌入
- 速度更快，成本更低

### 选项C：使用其他嵌入库

- OpenAI Embedding API
- Cohere Embedding
- 其他轻量方案

---

## 推荐

**首先尝试方法1（虚拟环境）**，这是最可靠的方式。

如果还有问题，告诉我：
1. 具体的错误信息
2. 你的Python版本
3. 操作系统版本

我会帮你找到最佳解决方案。
