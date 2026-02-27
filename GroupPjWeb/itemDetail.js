var productArray = [];
var productID;
let product;

generateProducts();

$(document).ready(function() {
    // 獲取URL參數中的商品ID
    const urlParams = new URLSearchParams(window.location.search);
    productID = parseInt(urlParams.get('id'));     

    // 滾動動畫效果
    function checkFadeIn() {
        $('.fade-in').each(function() {
            const elementTop = $(this).offset().top;
            const windowBottom = $(window).scrollTop() + $(window).height();
            
            if (elementTop < windowBottom - 50) {
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
        product = productArray.find(p => p[0]==productID);
        console.log(product);


        renderProductImages();
        
        renderProductInfo(product);

        renderRelatedProducts();

        $('#rating').text(product[4]);
        $('#ratingStars').html(getRatingStars(product[4]));
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
    })
    .catch(err => console.error(err));

}

function renderProductImages() {
    const container = $('#productImageContainer');
    let imagesHTML = '';
    
    // 主圖片
    imagesHTML += `<img src="${product[6]}" class="product-detail-image" alt="${product[3]}" id="mainProductImage">`;
    /*
    // 縮圖
    if (product.images.length > 1) {
        imagesHTML += '<div class="product-thumbnails">';
        product.images.forEach((image, index) => {
            imagesHTML += `
                <img src="${image}" class="product-thumbnail ${index === 0 ? 'active' : ''}" 
                        alt="${product.name} 圖片 ${index + 1}" 
                        onclick="changeProductImage('${image}', this)">
            `;
        });
        imagesHTML += '</div>';
    }
    */
    container.html(imagesHTML);
}

function renderProductInfo() {
    const container = $('#productInfoContent');
    
    const tag = product[2] =='None'? '':`<span class="product-tag">${product[2]}</span>`;
 
    const html = `
        <div class="product-detail-category">${product[1]}</div>
        <h1 class="product-detail-title">${product[3]}</h1>
        
         ${tag}
        <div class="product-meta">
            <div class="meta-item">
                <i class="bi bi-star-fill text-warning"></i>
                <span>${product[4]}</span>
            </div>
            <div class="meta-item">
                <i class="bi bi-tag"></i>
                <span>商品編號: PD${product[0].toString().padStart(3, '0')}</span>
            </div>
        </div>
       
        <div class="product-detail-price">HK$ ${product[5].toLocaleString()}</div>
        <p class="product-detail-description">${product[7]}</p>
        
        <div class="product-actions">
            <div class="quantity-selector d-flex justify-content-center">
                <button class="quantity-btn" type="button" onclick="changeQuantity(-1)">-</button>
                <input type="text" class="quantity-input" value="1" id="productQuantity" readonly>
                <button class="quantity-btn" type="button" onclick="changeQuantity(1)">+</button>
            </div>
            <button class="btn btn-primary btn-lg flex-grow-1 view-detail-btn" onclick="addToCart(${product[0]})">
                <i class="bi bi-cart-plus"></i> 加入購物車
            </button>
            <button class="btn btn-outline-primary btn-lg" onclick="addToWishlist(${product[0]})">
                <i class="bi bi-heart"></i>
            </button>
        </div>
        
        <div class="mt-4">
            <button class="btn btn-outline-secondary" onclick="shareProduct()">
                <i class="bi bi-share"></i> 分享商品
            </button>
        </div>
    `;
    
    container.html(html);
}


window.addToWishlist = function(productId) {

    if (!product) return;
    
    alert(`已將「${product[3]}」加入願望清單！`);
};

window.shareProduct = function() {

    if (navigator.share) {
        navigator.share({
            title: product[3],
            text: `查看這個精美的收藏品：${product[3]}`,
            url: window.location.href,
        }).catch(errr => {
            console.log("分享失敗:", err);
        });
    } else {
        alert('分享連結已複製到剪貼簿！');
        // 複製連結到剪貼簿
        navigator.clipboard.writeText(window.location.href)
        .catch(err => console.error("複製失敗:", err));
    }
};

function getRatingStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill text-warning"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="bi bi-star-half text-warning"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bi bi-star text-warning"></i>';
    }
    
    return stars;
}

window.changeQuantity = function(change) {
    const quantityInput = $('#productQuantity');
    let currentQuantity = parseInt(quantityInput.val());
    currentQuantity += change;
    
    if (currentQuantity < 1) currentQuantity = 1;
    if (currentQuantity > 99) currentQuantity = 99;
    
    quantityInput.val(currentQuantity);
};

function addToCart(productID){

    const quantity = parseInt(document.getElementById("productQuantity").value);
    console.log(quantity); // "1"    
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id == productID);

    
    if (existingItem) {
        existingItem.quantity += quantity;
        console.log("Add Existing");
    } else {
        cart.push({
            id: product[0],
            name: product[3],
            price: product[5],
            image: product[6],
            quantity: quantity
        });
        console.log("Added First Time");
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

function renderRelatedProducts() {
    const container = $('#relatedProducts');
    let html = '';

    for(i= 0; i<3;i++){
        const relatedID = (productID + i)%productArray.length;
        const relatedProduct = productArray[relatedID];

        console.log(relatedID);
        const tag = product[2] =='None'? '':`<span class="related-product-tag">${product[2]}</span>`;
        html += `
            <div class="col-md-4 mb-4 fade-in">
                <div class="related-product-card">
                    <img src="${relatedProduct[6]}" class="related-product-img" alt="${relatedProduct[3]}">
                    <div class="p-3">
                        ${tag}
                        <div class="product-category">${relatedProduct[1]}</div>
                        <h5 class="product-title">${relatedProduct[3]}</h5>
                        <div class="product-price">HK$ ${relatedProduct[5].toLocaleString()}</div>
                        <div class="d-flex justify-content-between mt-3">
                            <a href="onlineShop-detail.html?id=${relatedProduct[0]}" class="btn btn-outline-primary btn-sm view-detail-btn">
                                查看詳情
                            </a>
                            <button class="btn btn-primary btn-sm view-detail-btn" onclick="addToCart(${relatedProduct[0]})">
                                加入購物車
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    container.html(html);
}

updateCartCount();