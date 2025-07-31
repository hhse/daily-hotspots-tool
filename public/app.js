// 全局变量
let currentCategory = 'all';
let currentOffset = 0;
let currentLimit = 20;
let allHotspots = [];
let filteredHotspots = [];
let searchTerm = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadHotspots();
    loadCategories();
    setupEventListeners();
    
    // 添加页面加载动画
    showPageLoadingAnimation();
});

// 显示页面加载动画
function showPageLoadingAnimation() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.id = 'pageLoadingOverlay';
    loadingOverlay.innerHTML = `
        <div class="text-center">
            <div class="spinner-border mb-3" role="status"></div>
            <h5 class="mt-2">正在加载热点数据...</h5>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    // 2秒后移除动画
    setTimeout(() => {
        const overlay = document.getElementById('pageLoadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
        }
    }, 1500);
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索框回车事件
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchHotspots();
        }
    });

    // 搜索框输入事件（实时搜索）
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        if (searchTerm.length >= 2 || searchTerm.length === 0) {
            debounceSearch();
        }
    });
    
    // 加载更多按钮点击事件
    document.getElementById('loadMoreBtn').querySelector('button').addEventListener('click', loadMore);
    
    // 添加页面滚动事件，实现滚动加载
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            // 当用户滚动到距离底部500px时，自动加载更多
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn && loadMoreBtn.style.display !== 'none') {
                loadMore();
            }
        }
    });
}

// 防抖搜索
let searchTimeout;
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterAndDisplayHotspots();
    }, 300);
}

// 加载热点数据
async function loadHotspots() {
    showLoading(true);
    try {
        const response = await fetch(`/api/hotspots?limit=${currentLimit}&offset=${currentOffset}`);
        const data = await response.json();
        
        if (currentOffset === 0) {
            allHotspots = data;
        } else {
            allHotspots = [...allHotspots, ...data];
        }
        
        filteredHotspots = allHotspots;
        filterAndDisplayHotspots();
        
        // 显示加载更多按钮
        if (data.length === currentLimit) {
            document.getElementById('loadMoreBtn').style.display = 'block';
        } else {
            document.getElementById('loadMoreBtn').style.display = 'none';
        }
    } catch (error) {
        console.error('加载热点数据失败:', error);
        showError('加载数据失败，请稍后重试');
    } finally {
        showLoading(false);
    }
}

// 加载分类数据
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('加载分类数据失败:', error);
    }
}

// 显示分类列表
function displayCategories(categories) {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';
    
    // 为分类添加不同的颜色和图标
    const categoryIcons = {
        '科技': 'fas fa-microchip',
        '娱乐': 'fas fa-film',
        '体育': 'fas fa-futbol',
        '财经': 'fas fa-chart-line',
        '社会': 'fas fa-users',
        '健康': 'fas fa-heartbeat',
        '教育': 'fas fa-graduation-cap',
        '国际': 'fas fa-globe',
        '汽车': 'fas fa-car',
        '微博热搜': 'fab fa-weibo',
        '其他': 'fas fa-ellipsis-h'
    };
    
    const colors = [
        'primary', 'success', 'danger', 'warning', 'info', 'secondary'
    ];
    
    categories.forEach((category, index) => {
        const colorClass = colors[index % colors.length];
        const icon = categoryIcons[category.name] || 'fas fa-tag';
        
        const button = document.createElement('button');
        button.className = `btn btn-outline-${colorClass} category-btn w-100`;
        button.onclick = () => filterByCategory(category.name);
        button.innerHTML = `
            <i class="${icon}"></i>${category.name}
            <span class="category-count">${category.count}</span>
        `;
        categoryList.appendChild(button);
    });
}

// 按分类筛选
function filterByCategory(category) {
    currentCategory = category;
    currentOffset = 0;
    
    // 更新按钮状态
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (category === 'all') {
        document.querySelector('.btn-primary').classList.add('active');
    } else {
        const categoryBtn = Array.from(document.querySelectorAll('.category-btn'))
            .find(btn => btn.textContent.trim().includes(category));
        if (categoryBtn) {
            categoryBtn.classList.add('active');
        }
    }
    
    // 显示过滤动画
    showFilterAnimation();
    
    // 重新加载数据
    loadHotspots();
}

// 显示过滤动画
function showFilterAnimation() {
    const container = document.getElementById('hotspotsList');
    container.classList.add('fade-out');
    
    setTimeout(() => {
        container.classList.remove('fade-out');
        container.classList.add('fade-in');
        setTimeout(() => container.classList.remove('fade-in'), 500);
    }, 300);
}

// 搜索热点
function searchHotspots() {
    searchTerm = document.getElementById('searchInput').value.trim();
    filterAndDisplayHotspots();
}

// 筛选并显示热点
function filterAndDisplayHotspots() {
    let filtered = allHotspots;
    
    // 按分类筛选
    if (currentCategory !== 'all') {
        filtered = filtered.filter(hotspot => hotspot.category === currentCategory);
    }
    
    // 按搜索词筛选
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(hotspot => 
            hotspot.title.toLowerCase().includes(term) ||
            (hotspot.content && hotspot.content.toLowerCase().includes(term))
        );
    }
    
    filteredHotspots = filtered;
    displayHotspots(filtered);
    updateTotalCount(filtered.length);
}

// 显示热点列表
function displayHotspots(hotspots) {
    const container = document.getElementById('hotspotsList');
    
    if (hotspots.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h5>暂无数据</h5>
                    <p>没有找到匹配的热点事件</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = hotspots.map(hotspot => createHotspotCard(hotspot)).join('');
    
    // 添加淡入动画
    const cards = container.querySelectorAll('.hotspot-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 50);
    });
}

// 创建热点卡片
function createHotspotCard(hotspot) {
    const title = searchTerm ? highlightSearchTerm(hotspot.title, searchTerm) : hotspot.title;
    const content = searchTerm && hotspot.content ? 
        highlightSearchTerm(hotspot.content, searchTerm) : 
        (hotspot.content || '暂无详细内容');
    
    // 根据分类选择不同的颜色和图标
    const categoryIcons = {
        '科技': 'fas fa-microchip',
        '娱乐': 'fas fa-film',
        '体育': 'fas fa-futbol',
        '财经': 'fas fa-chart-line',
        '社会': 'fas fa-users',
        '健康': 'fas fa-heartbeat',
        '教育': 'fas fa-graduation-cap',
        '国际': 'fas fa-globe',
        '汽车': 'fas fa-car',
        '微博热搜': 'fab fa-weibo',
        '其他': 'fas fa-tag'
    };
    
    const icon = categoryIcons[hotspot.category] || 'fas fa-tag';
    
    let badgeClass = 'bg-primary';
    switch(hotspot.category) {
        case '科技': badgeClass = 'bg-info'; break;
        case '娱乐': badgeClass = 'bg-purple'; break;
        case '体育': badgeClass = 'bg-success'; break;
        case '财经': badgeClass = 'bg-warning'; break;
        case '社会': badgeClass = 'bg-danger'; break;
        case '健康': badgeClass = 'bg-success'; break;
        case '教育': badgeClass = 'bg-info'; break;
        case '国际': badgeClass = 'bg-primary'; break;
        case '汽车': badgeClass = 'bg-secondary'; break;
        case '微博热搜': badgeClass = 'bg-danger'; break;
    }
    
    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card hotspot-card" onclick="showHotspotDetail(${hotspot.id})">
                <div class="card-body">
                    <div class="hotspot-card-header">
                        <span class="badge category-badge ${badgeClass}"><i class="${icon} me-1"></i>${hotspot.category}</span>
                        <span class="time-tag"><i class="far fa-clock me-1"></i>${formatTime(hotspot.publish_time)}</span>
                    </div>
                    <h6 class="hotspot-title">${title}</h6>
                    <p class="hotspot-content">${content}</p>
                    <div class="hotspot-card-footer">
                        <div class="hotspot-meta">
                            <i class="fas fa-tag"></i>${hotspot.source}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 高亮搜索词
function highlightSearchTerm(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// 显示热点详情
async function showHotspotDetail(id) {
    const hotspot = allHotspots.find(h => h.id === id);
    if (!hotspot) return;
    
    document.getElementById('detailTitle').textContent = hotspot.title;
    document.getElementById('detailContent').textContent = hotspot.content || '暂无详细内容';
    document.getElementById('detailSource').textContent = hotspot.source;
    document.getElementById('detailTime').textContent = formatTime(hotspot.publish_time);
    
    const detailUrl = document.getElementById('detailUrl');
    if (hotspot.url && hotspot.url !== '#') {
        detailUrl.href = hotspot.url;
        detailUrl.style.display = 'inline-block';
    } else {
        detailUrl.style.display = 'none';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('hotspotDetailModal'));
    modal.show();
}

// 添加新热点
async function addHotspot() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const category = document.getElementById('category').value;
    const source = document.getElementById('source').value.trim();
    const url = document.getElementById('url').value.trim();
    
    if (!title) {
        showError('标题不能为空');
        return;
    }
    
    try {
        const response = await fetch('/api/hotspots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                content,
                category,
                source,
                url
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('添加成功');
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('addHotspotModal'));
            modal.hide();
            
            // 清空表单
            document.getElementById('addHotspotForm').reset();
            
            // 重新加载数据
            currentOffset = 0;
            loadHotspots();
            loadCategories();
        } else {
            showError(result.error || '添加失败');
        }
    } catch (error) {
        console.error('添加热点失败:', error);
        showError('添加失败，请稍后重试');
    }
}

// 删除热点
async function deleteHotspot(id) {
    if (!confirm('确定要删除这个热点吗？')) return;
    
    try {
        const response = await fetch(`/api/hotspots/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('删除成功');
            // 从本地数据中移除
            allHotspots = allHotspots.filter(h => h.id !== id);
            filterAndDisplayHotspots();
            loadCategories();
        } else {
            showError('删除失败');
        }
    } catch (error) {
        console.error('删除热点失败:', error);
        showError('删除失败，请稍后重试');
    }
}

// 加载更多
function loadMore() {
    currentOffset += currentLimit;
    loadHotspots();
}

// 刷新数据
function refreshData() {
    // 显示刷新动画
    const refreshBtn = document.querySelector('button[onclick="refreshData()"]');
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> 刷新中...';
    
    currentOffset = 0;
    currentCategory = 'all';
    searchTerm = '';
    document.getElementById('searchInput').value = '';
    
    // 更新分类按钮状态
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.btn-primary').classList.add('active');
    
    // 加载数据
    Promise.all([loadHotspots(), loadCategories()])
        .finally(() => {
            setTimeout(() => {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i> 刷新数据';
                showSuccess('数据已刷新');
            }, 500);
        });
}

// 更新总数显示
function updateTotalCount(count) {
    document.getElementById('totalCount').textContent = count;
}

// 格式化时间
function formatTime(timeStr) {
    if (!timeStr) return '';
    
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
        return `${minutes}分钟前`;
    } else if (hours < 24) {
        return `${hours}小时前`;
    } else if (days < 7) {
        return `${days}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// 显示加载状态
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'block' : 'none';
}

// 显示成功消息
function showSuccess(message) {
    showToast(message, 'success');
}

// 显示错误消息
function showError(message) {
    showToast(message, 'danger');
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 创建toast元素
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        delay: 3000,
        animation: true
    });
    bsToast.show();
    
    // 自动移除toast元素
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
} 