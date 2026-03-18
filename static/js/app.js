// 应用主逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 加载知识库信息
    loadKbInfo();

    // 绑定表单提交事件
    document.getElementById('plan-form').addEventListener('submit', handlePlanSubmit);
    document.getElementById('kb-form').addEventListener('submit', handleKbSubmit);

    // 绑定Tab切换事件
    initTabs();
});

// 初始化Tab切换
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // 移除所有active状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 添加active状态
            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

// 加载知识库信息
async function loadKbInfo() {
    try {
        const response = await fetch('/kb-info');
        const result = await response.json();

        if (result.success) {
            const statsDiv = document.getElementById('kb-stats');
            statsDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2em;">📊</span>
                    <div>
                        <div style="font-size: 0.9em; opacity: 0.8;">知识库状态</div>
                        <div style="font-size: 1.2em;">
                            <strong>${result.data.name}</strong> ·
                            <strong>${result.data.document_count}</strong> 条文档
                        </div>
                    </div>
                </div>
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

    // 显示之前的结果
    const resultSection = document.getElementById('plan-result');

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
            showError(resultSection, result.error || '规划失败');
        }
    } catch (error) {
        console.error('规划失败:', error);
        showError(resultSection, '网络错误，请稍后重试');
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
            // 使用自定义提示
            showToast('知识添加成功！', 'success');

            // 清空输入框
            document.getElementById('knowledge-text').value = '';

            // 重新加载知识库信息
            await loadKbInfo();
        } else {
            showToast(result.error || '添加失败', 'error');
        }
    } catch (error) {
        console.error('添加知识失败:', error);
        showToast('网络错误，请稍后重试', 'error');
    } finally {
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// 显示Toast提示
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = type === 'success' ? `✅ ${message}` : `❌ ${message}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 显示规划结果
function displayPlanResult(data) {
    const resultSection = document.getElementById('plan-result');
    const travelPlan = data.travel_plan || '';
    const userInput = data.user_input || ''; // 获取原始用户输入

    // 显示结果区域
    resultSection.style.display = 'block';

    // 解析并填充各个Tab，传入原始用户输入
    parseAndFillTabs(travelPlan, data.knowledge_retrieved, userInput);

    // 滚动到结果区域
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 解析并填充Tab内容
function parseAndFillTabs(travelPlan, knowledgeInfo, userInput) {
    const planText = travelPlan;

    // 1. 概览Tab（传入原始用户输入）
    fillOverviewTab(planText, userInput);

    // 2. 详细路线Tab
    fillItineraryTab(planText);

    // 3. 酒店推荐Tab
    fillHotelsTab(planText);

    // 4. 实用建议Tab
    fillTipsTab(planText);

    // 5. 知识库Tab
    fillKnowledgeTab(knowledgeInfo);
}

// 填充概览Tab
function fillOverviewTab(planText, userInput) {
    const tab = document.getElementById('tab-overview');

    // 从用户输入中提取关键信息（更准确）
    const daysMatch = userInput.match(/(\d+)天/);
    const peopleMatch = userInput.match(/(\d+)人/);
    const budgetMatch = userInput.match(/预算.*?(\d+元|\d+万)|(\d+)元.*?预算/);

    let html = '';

    // 概览卡片
    html += '<div class="overview-grid">';

    if (peopleMatch) {
        html += `
            <div class="overview-item">
                <div class="item-icon">👥</div>
                <div class="item-label">出行人数</div>
                <div class="item-value">${peopleMatch[1]}人</div>
            </div>
        `;
    }

    if (daysMatch) {
        html += `
            <div class="overview-item">
                <div class="item-icon">📅</div>
                <div class="item-label">行程天数</div>
                <div class="item-value">${daysMatch[1]}天</div>
            </div>
        `;
    }

    if (budgetMatch) {
        const budget = budgetMatch[1] || budgetMatch[2];
        html += `
            <div class="overview-item">
                <div class="item-icon">💰</div>
                <div class="item-label">预算范围</div>
                <div class="item-value">${budget}</div>
            </div>
        `;
    }

    html += `
        <div class="overview-item">
            <div class="item-icon">🎯</div>
            <div class="item-label">规划状态</div>
            <div class="item-value">已生成</div>
        </div>
    `;

    html += '</div>';

    // 行程摘要
    const summaryMatch = planText.match(/行程概览[^。]*。(.*?)?(?=详细|$|第)/s);
    if (summaryMatch) {
        html += `
            <div class="result-card">
                <h3><span class="card-icon">📋</span>行程摘要</h3>
                <p>${formatMarkdown(summaryMatch[1] || planText.substring(0, 200))}</p>
            </div>
        `;
    } else {
        html += `
            <div class="result-card">
                <h3><span class="card-icon">📋</span>行程摘要</h3>
                <p>${formatMarkdown(planText.substring(0, 300) + '...')}</p>
            </div>
        `;
    }

    tab.innerHTML = html;
}

// 填充路线Tab
function fillItineraryTab(planText) {
    const tab = document.getElementById('tab-itinerary');

    // 尝试按天数解析
    const dayMatches = planText.matchAll(/第?(\d+)天[:：]?\n([^第]*)/g);
    const days = Array.from(dayMatches);

    let html = '';

    if (days.length > 0) {
        days.forEach((match, index) => {
            const dayNum = match[1];
            const dayContent = match[2].trim();

            html += `
                <div class="itinerary-day">
                    <div class="itinerary-day-header">
                        <span class="day-badge">第${dayNum}天</span>
                        <span class="day-title">行程安排</span>
                    </div>
                    <div>${formatMarkdown(dayContent)}</div>
                </div>
            `;
        });
    } else {
        // 尝试其他格式
        const sections = planText.split(/详细路线|每天行程/);
        if (sections.length > 1) {
            html += `<div class="result-card">${formatMarkdown(sections[1])}</div>`;
        } else {
            html += `
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <p>详细路线信息正在整理中...</p>
                </div>
            `;
        }
    }

    tab.innerHTML = html;
}

// 填充酒店Tab
function fillHotelsTab(planText) {
    const tab = document.getElementById('tab-hotels');

    // 尝试提取酒店信息
    const hotelSection = planText.match(/酒店推荐[^。（]*(.*?)(?=实用|交通|美食|建议|$)/s);
    let html = '';

    if (hotelSection) {
        const hotelText = hotelSection[1];
        const hotelMatches = hotelText.matchAll(/([^。，\n]+?酒店|[^。，\n]+?度假村|[^。，\n]+?宾馆)([^。，\n]+)/g);

        const hotels = Array.from(hotelMatches);

        if (hotels.length > 0) {
            hotels.forEach(hotel => {
                const name = hotel[1].trim();
                const reason = hotel[2].trim();
                html += `
                    <div class="hotel-card">
                        <div class="hotel-name">
                            ${name}
                            <span class="hotel-recommend">推荐</span>
                        </div>
                        <div class="hotel-reason">${reason}</div>
                    </div>
                `;
            });
        } else {
            html += `<div class="result-card">${formatMarkdown(hotelText)}</div>`;
        }
    } else {
        html += `
            <div class="empty-state">
                <div class="empty-icon">🏨</div>
                <p>酒店推荐信息正在整理中...</p>
            </div>
        `;
    }

    tab.innerHTML = html;
}

// 填充建议Tab
function fillTipsTab(planText) {
    const tab = document.getElementById('tab-tips');

    // 提取各种建议
    const tips = [
        { icon: '🚗', title: '交通建议', pattern: /交通[:：]?\s*([^。（]*?)(?=美食|酒店|注意|$)/s },
        { icon: '🍜', title: '美食推荐', pattern: /美食[:：]?\s*([^。（]*?)(?=交通|酒店|注意|$)/s },
        { icon: '⚠️', title: '注意事项', pattern: /注意[:：]?\s*([^。（]*?)(?=交通|美食|酒店|$)/s },
        { icon: '🎒', title: '其他建议', pattern: /建议[:：]?\s*([^。（]*?)(?=交通|美食|酒店|$)/s }
    ];

    let html = '<div class="tips-grid">';

    let foundCount = 0;
    tips.forEach(tip => {
        const match = planText.match(tip.pattern);
        if (match && match[1].trim()) {
            foundCount++;
            html += `
                <div class="tip-card">
                    <div class="tip-card-header">
                        <span class="tip-icon">${tip.icon}</span>
                        <span class="tip-title">${tip.title}</span>
                    </div>
                    <div class="tip-content">${formatMarkdown(match[1].trim())}</div>
                </div>
            `;
        }
    });

    html += '</div>';

    if (foundCount === 0) {
        html = `
            <div class="result-card">
                <h3><span class="card-icon">💡</span>实用建议</h3>
                <p>${formatMarkdown(planText.substring(0, 500))}</p>
            </div>
        `;
    }

    tab.innerHTML = html;
}

// 填充知识库Tab
function fillKnowledgeTab(knowledgeInfo) {
    const tab = document.getElementById('tab-knowledge');

    if (!knowledgeInfo || knowledgeInfo.count === 0) {
        tab.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <p>本次规划未使用知识库信息</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="result-card">
            <h3><span class="card-icon">📚</span>知识库检索结果</h3>
            <p style="margin-bottom: 15px;">从知识库中检索到 <strong>${knowledgeInfo.count}</strong> 条相关信息</p>
            <div class="knowledge-tags">
    `;

    knowledgeInfo.items.forEach((item, index) => {
        const shortText = item.length > 50 ? item.substring(0, 50) + '...' : item;
        html += `
            <div class="knowledge-tag">
                <span class="tag-icon">📄</span>
                ${shortText}
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    tab.innerHTML = html;
}

// 显示错误
function showError(container, message) {
    container.style.display = 'block';

    // 先确保所有tab都初始化
    const tabsContent = container.querySelector('.tabs-content');
    if (tabsContent) {
        const activeTab = tabsContent.querySelector('.tab-content.active');
        if (activeTab) {
            activeTab.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❌</div>
                    <p style="color: #f44336;">${message}</p>
                </div>
            `;
        } else {
            // 如果没有active tab，在overview tab中显示
            const overviewTab = document.getElementById('tab-overview');
            if (overviewTab) {
                overviewTab.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">❌</div>
                        <p style="color: #f44336;">${message}</p>
                    </div>
                `;
                overviewTab.classList.add('active');
            }
        }
    } else {
        // fallback
        console.error('显示错误:', message);
        showToast(message, 'error');
    }
}

// 简单的Markdown格式化
function formatMarkdown(text) {
    if (!text) return '';

    // 转换粗体
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 转换列表项
    text = text.replace(/^- (.*$)/gm, '<li>$1</li>');
    text = text.replace(/(\n<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // 转换换行
    text = text.replace(/\n/g, '<br>');

    // 清理多余的ul标签
    text = text.replace(/<ul><ul>/g, '<ul>');
    text = text.replace(/<\/ul><\/ul>/g, '</ul>');

    return text;
}
