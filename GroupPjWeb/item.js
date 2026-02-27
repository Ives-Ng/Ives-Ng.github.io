var productArray = [];
let filterProductArray = [];

generateProducts();

$(document).ready(function() {    
    
    
    // 滾動動畫效果
    function checkFadeIn() {
        $('.fade-in').each(function() {
            const elementTop = $(this).offset().top;
            const windowBottom = $(window).scrollTop() + $(window).height();
            
            if (elementTop < windowBottom - 100) {
                $(this).addClass('visible');
            }
        });
    }
    
    checkFadeIn();
    $(window).scroll(checkFadeIn);
});


function generateProducts() {
    $('#cartCount').hide();
    loadCSV().then(() => {
        renderProduct();

        //localStorage.removeItem('cart');
    });
}

function loadCSV() {
    return fetch('productsList.csv')
    .then(response => response.text())
    .then(text => {
        //console.log(text); // 原始 CSV 文本
        const rows = text.split('\n');

        rows.shift();
        rows.shift();
        rows.pop();

        productArray = rows.map(row => row.split(','));
        console.log("csv: " + productArray);
        //rows.forEach(row => console.log(row));

        filterProductArray = [...productArray];
    })
    .catch(err => console.error(err));

}

function renderProduct(){
    const productGrid = $('#productGrid');
    productGrid.empty();
    //let filterProductArray = [...productArray];


    filterProductArray.forEach(product => { 
        
        const tag = product[2] =='None'? '':`<span class="product-tag">${product[2]}</span>`;

        const Item = `
            <div id="productGrid" class="cake-grid">
                <div class="cake-item fade-in">
                    <div class="cake-image-container">
                        <img src="${product[6]}" class="product-image" alt="test">
                    </div>
                    <div class="product-details">
                        <div class="product-category">${product[1]}</div>
                        <h3 class="product-title">${product[3]}</h3>
                        <p class="product-description">${product[7]}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="product-price">HK$ ${product[5]}</div>
                        </div>
                        ${tag}
                        <div class="d-flex justify-content-between mt-3">
                            <a href="onlineShop-detail.html?id=${product[0]}" class="view-detail-btn">
                                <i class="bi bi-eye"></i> 查看詳情
                            </a>
                            <button class="view-detail-btn" onclick="addToCart(${product[0]})">
                                <i class="bi bi-cart-plus"></i> 加入購物車
                            </button>      
                        </div>
                    <div class="mt-2 text-muted small">
                        <i class="bi bi-star-fill text-warning"></i> ${product[4]}
                    </div>

                    </div>       
                </div>
            </div>
        `;
        productGrid.append(Item);
    });

    $('#itemCount').text(filterProductArray.length);

    setTimeout(() => {
        checkFadeIn();
    }, 100);
}

function applyFilters(){
    filterProductArray = [];
    
    const selectedCategories = [];
    const selectedTags = [];

    if ($('#filterAll').is(':checked')){
        filterProductArray = [...productArray];
    }
    else{
        if ($('#filterChocolate').is(':checked')) selectedCategories.push('動漫系列');
        if ($('#filterFruit').is(':checked')) selectedCategories.push('電影系列');
        if ($('#filterCheese').is(':checked')) selectedCategories.push('遊戲系列');
        if ($('#filterWedding').is(':checked')) selectedCategories.push('Chiikawa系列');
        if ($('#filterSeasonal').is(':checked')) selectedCategories.push('迪士尼系列');
    }

    if ($('#filterNew').is(':checked')) selectedTags.push('新品');
    if ($('#filterBestseller').is(':checked')) selectedTags.push('熱銷');
    if ($('#filterVegan').is(':checked')) selectedTags.push('特價');
    if ($('#filterGlutenFree').is(':checked')) selectedTags.push('預訂');

    filterProductArray = productArray.filter(item => {
        if(selectedCategories.length > 0){
            if(!selectedCategories.includes(item[1]))
                return false;                    
        }

        if(selectedTags.length > 0){
            if(!selectedTags.includes(item[2]))
                return false;
        }

        return true;
    });
    sortItem();
    renderProduct();
    
}

function resetFilters(){
    $('#filterAll, #filterChocolate, #filterFruit, #filterCheese, #filterWedding, #filterSeasonal').prop('checked', true);
    $('#filterNew, #filterBestseller, #filterVegan, #filterGlutenFree').prop('checked', false);
    $('#sortSelect').val('default');

    filterProductArray = [...productArray];
    renderProduct();
}

function sortItem(){
    const sortOption = $('#sortSelect').val();
    console.log("sorting");
    switch(sortOption){
        case 'name':
            filterProductArray.sort((a, b) => a[1].localeCompare(b[1], 'zh-Hant'));
            break;
        case 'popular':
            filterProductArray.sort((a, b) => b[4] - a[4]);
            break;
        case 'price':
            filterProductArray.sort((a, b) => a[5] - b[5]);
            break;
        case 'newest':
            filterProductArray.sort((a, b) => b[0] - a[0]);
            break;
        default:
            break;
    }

    renderProduct();
}

function checkFadeIn() {
    $('.fade-in').each(function() {
        const elementTop = $(this).offset().top;
        const windowBottom = $(window).scrollTop() + $(window).height();
        
        if (elementTop < windowBottom - 30) {
            $(this).addClass('visible');
        }
    });
}

function addToCart(productID){
    const product = productArray.find(p => p[0]==productID)

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id == productID);

    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log("Addedededed");
    } else {
        cart.push({
            id: product[0],
            name: product[3],
            price: product[5],
            image: product[6],
            quantity: 1
        });
        console.log("Added");
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartCount();

    showAlert(`已將「${product[3]}」加入購物車！`, 'success');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    $('#cartCount').text(totalItems);

    // 如果購物車為空，隱藏計數
    if (totalItems <= 0) {
        $('#cartCount').hide();
    } else {
        $('#cartCount').show();

    }
}



function showAlert(message, type) {

    $('.alert-notification').remove();
    
    let alertClass, icon;
    if (type === 'success') {
        alertClass = 'alert-success';
        icon = 'bi-check-circle';
    } else if (type === 'warning') {
        alertClass = 'alert-warning';
        icon = 'bi-exclamation-triangle';
    } else {
        alertClass = 'alert-info';
        icon = 'bi-info-circle';
    }
    
    const alertHTML = `
        <div class="alert ${alertClass} alert-notification alert-dismissible fade show position-fixed" 
                style="top: 100px; right: 20px; z-index: 1050; min-width: 300px;">
            <i class="bi ${icon}"></i> ${message}
            <button type="button" class="btn-close" onclick="$(this).parent().fadeOut()"></button>
        </div>
    `;
    
    $('body').append(alertHTML);
    
    setTimeout(() => {
        $('.alert-notification').fadeOut(function() {
            $(this).remove();
        });
    }, 3000);
}

updateCartCount();