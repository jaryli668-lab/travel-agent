"""
Web界面 - Flask应用
"""
import os
import sys
from flask import Flask, render_template, request, jsonify
from src.agent import TravelAgent
from config import Config


app = Flask(__name__)
app.secret_key = os.urandom(24)

# 添加src到Python路径（确保能找到agent模块）
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# 初始化Agent
agent = None


def init_agent():
    """初始化Agent（懒加载）"""
    global agent
    if agent is None:
        try:
            agent = TravelAgent()
        except Exception as e:
            print(f"Agent初始化失败: {e}")


@app.route('/')
def index():
    """首页"""
    return render_template('index.html')


@app.route('/plan', methods=['POST'])
def plan():
    """规划旅行"""
    try:
        init_agent()
        
        # 获取用户输入
        user_input = request.form.get('user_input')
        destination = request.form.get('destination')
        budget_max = request.form.get('budget_max')
        
        if not user_input:
            return jsonify({
                'success': False,
                'error': '请输入旅行需求'
            })
        
        # 构建过滤条件
        filters = {}
        if destination:
            filters['destination'] = destination
        if budget_max:
            try:
                filters['budget_max'] = int(budget_max)
            except ValueError:
                pass
        
        # 调用Agent规划
        result = agent.plan_travel(user_input, filters)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


@app.route('/add-knowledge', methods=['POST'])
def add_knowledge():
    """添加知识"""
    try:
        init_agent()
        
        # 获取知识文本
        knowledge_text = request.form.get('knowledge_text')
        
        if not knowledge_text:
            return jsonify({
                'success': False,
                'error': '请输入知识内容'
            })
        
        # 添加到知识库
        agent.add_knowledge(
            documents=[knowledge_text],
            metadatas=[{'source': 'web', 'timestamp': 'now'}]
        )
        
        return jsonify({
            'success': True,
            'message': '知识添加成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


@app.route('/kb-info')
def kb_info():
    """知识库信息"""
    try:
        init_agent()
        info = agent.get_knowledge_base_info()
        return jsonify({
            'success': True,
            'data': info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


@app.route('/health')
def health():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'service': 'travel-agent-web'
    })


if __name__ == '__main__':
    Config.validate()
    app.run(host='0.0.0.0', port=5000, debug=True)
