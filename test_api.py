"""
测试千问API配置和连接
"""
import os
from dotenv import load_dotenv
from config import Config


def test_config():
    """测试配置"""
    print("="*60)
    print("千问API配置测试")
    print("="*60)
    
    try:
        # 加载环境变量
        load_dotenv()
        print("\n✅ 环境变量文件加载成功")
        
        # 检查API Key
        print(f"\nAPI Key配置: {Config.QIWEN_API_KEY[:20]}...") if Config.QIWEN_API_KEY else "❌ 未配置"
        print(f"API Base: {Config.QIWEN_API_BASE}")
        print(f"模型名称: {Config.QIWEN_MODEL}")
        
        # 验证配置
        print("\n验证配置...")
        Config.validate()
        print("✅ 配置验证通过")
        
        # 检查.env文件
        print(f"\n.env文件存在: {os.path.exists('.env')}")
        print(f".env.example文件存在: {os.path.exists('.env.example')}")
        
    except Exception as e:
        print(f"\n❌ 配置测试失败: {e}")
        return False
    
    return True


def test_qiwen_api():
    """测试千问API连接"""
    print("\n" + "="*60)
    print("测试千问API连接")
    print("="*60)
    
    try:
        from qiwen_api import QwenClient
        
        client = QwenClient()
        
        # 发送测试消息
        print("\n发送测试消息...")
        response = client.chat_completion([
            {"role": "user", "content": "你好，请回复：测试成功"}
        ], temperature=0.5, max_tokens=50)
        
        print(f"\n✅ API连接成功")
        print(f"\nAI响应:")
        print("-" * 60)
        print(response)
        print("-" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ API连接失败: {e}")
        print(f"\n错误类型: {type(e).__name__}")
        print(f"错误详情: {str(e)}")
        return False


def main():
    """主函数"""
    print("🧪 千问API测试工具\n")
    
    # 步骤1: 测试配置
    config_ok = test_config()
    
    if not config_ok:
        print("\n⚠️  配置有问题，请先配置.env文件")
        print("\n配置步骤:")
        print("1. 复制配置文件: cp .env.example .env")
        print("2. 编辑.env文件，填入你的千问API Key")
        print("3. 再次运行测试")
        return
    
    # 步骤2: 测试API连接
    api_ok = test_qiwen_api()
    
    # 总结
    print("\n" + "="*60)
    print("测试总结")
    print("="*60)
    
    if config_ok and api_ok:
        print("✅ 所有测试通过！可以正常使用")
    else:
        print("❌ 测试失败，请检查配置")
    
    print("="*60)


if __name__ == "__main__":
    main()
