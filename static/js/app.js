// 应用主逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 加载知识库信息
    loadKbInfo();
    
    // 绑定表单提交事件
    document.getElementById('plan-form').addEventListener('submit', handlePlanSubmit);
    document.getElementById('kb-form').addEventListener('submit', handleKbSubmit);
});

// 加载知识库信息
async function loadKbInfo() {
    try {
        const response = await fetch('/kb-info');
        const result = await response.json();
        
        if (result.success) {
            const statsDiv = document.getElementById('kb-stats');
            statsDiv.innerHTML = `
                <p>📊 知识库状态</p>
                <p style="margin-top: 10px;">
                    <strong>集合名称:</strong> ${result.data.name}<br>
                    <strong>文档数量:</strong> ${result.data.document_count}
                </p>
            `;
        }
    } catch (error) {
        console.error('加载知识库信息失败:', error);
        document.getElementById('kb-stats').innerHTML = '<p style="color: #c33;">加载失败</p>';
    }
}

// 处理行程规划提交
async function handlePlanSubmit(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // 显示加载状态
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> 规划中...';
    
    // 隐藏之前的结果
    const resultArea = document.getElementById('plan-result');
    resultArea.style.display = 'none';
    
    try {
        const formData = new FormData(event.target);
        const response = await fetch('/plan', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayPlanResult(result.data);
        } else {
            showError(resultArea, result.error || '规划失败');
        }
    } catch (error) {
        console.error('规划失败:', error);
        showError(resultArea, '网络错误，请稍后重试');
    } finally {
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// 处理知识库提交
async function handleKbSubmit(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    const knowledgeText = document.getElementById('knowledge-text').value.trim();
    
    if (!knowledgeText) {
        alert('请输入知识内容');
        return;
    }
    
    // 显示加载状态
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> 添加中...';
    
    try {
        const formData = new FormData(event.target);
        const response = await fetch('/add-knowledge', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 显示成功消息
            showSuccess(resultArea, '知识添加成功！');
            
            // 清空输入框
            document.getElementById('knowledge-text').value = '';
            
            // 重新加载知识库信息
            await loadKbInfo();
            
            // 3秒后隐藏消息
            setTimeout(() => {
                resultArea.style.display = 'none';
            }, 3000);
        } else {
            showError(resultArea, result.error || '添加失败');
        }
    } catch (error) {
        console.error('添加知识失败:', error);
        showError(resultArea, '网络错误，请稍后重试');
    } finally {
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// 显示规划结果
function displayPlanResult(data) {
    const resultArea = document.getElementById('plan-result');
    const contentDiv = document.getElementById('plan-content');
    
    // 显示区域
    resultArea.style.display = 'block';
    
    // 格式化并显示结果
    const travelPlan = data.travel_plan || '未生成规划';
    const knowledgeInfo = data.knowledge_retrieved || {};
    
    let html = '';
    
    // 显示知识库检索结果
    if (knowledgeInfo.count > 0) {
        html += `
            <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <h4 style="margin-bottom: 10px; color: #1e40af;">📚 使用了 ${knowledgeInfo.count} 条相关知识</h4>
                <ul style="margin-left: 20px;">
                    ${knowledgeInfo.items.map(item => `<li style="margin-bottom: 5px;">${item.substring(0, 100)}${item.length > 100 ? '...' : ''}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // 显示AI生成的行程规划
    html += `
        <div style="white-space: pre-wrap; line-height: 1.8;">
            ${formatMarkdown(travelPlan)}
        </div>
    `;
    
    contentDiv.innerHTML = html;
    
    // 滚动到结果区域
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 显示错误
function showError(container, message) {
    container.style.display = 'block';
    const contentDiv = container.querySelector('#plan-content') || container;
    contentDiv.innerHTML = `<div class="error">❌ ${message}</div>`;
}

// 显示成功
function showSuccess(container, message) {
    const contentDiv = container.querySelector('#plan-content') || container;
    contentDiv.innerHTML = `<div class="success">✅ ${message}</div>`;
}

// 简单的Markdown格式化
function formatMarkdown(text) {
    if (!text) return '';
    
    // 转换粗体
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 转换列表项
    text = text.replace(/^- (.*$)/gm, '<li>$1</li>');
    text = text.replace(/(\n<li>.*<\/li>\n)/g, '<ul>$1</ul>\n');
    
    // 转换换行
    text = text.replace(/\n/g, '<br>');
    
    return text;
}
