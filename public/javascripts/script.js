document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);

const $arrowLeft = document.getElementById('arrow-left');
const $arrowRight = document.getElementById('arrow-right');
const $imageDisplay = document.querySelector('.imageDisplay')
const $allProductsImage = document.querySelectorAll('.product-img')
// const allProductsImageSr

//PRODUCT DETAILS: Display each picture when clicking on the arrow left and right
const $mainImage = document.querySelector('.active')

const $sideImages = document.querySelectorAll('.inactive')

$sideImages.forEach(el=>el.onclick = function () {
    const replaceSrc = $mainImage.src;
    $mainImage.src=el.src
    el.src=replaceSrc;
})

//WISHLIST 

const heartSrc = 'https://res.cloudinary.com/vanbaotran/image/upload/v1623145410/photos/heart_jmddcq.png'
const heartFilledSrc ='https://res.cloudinary.com/vanbaotran/image/upload/v1623145429/photos/heart-filled_njjmsq.png'
const $heart = document.querySelectorAll('.heart');
$heart.forEach(el=>el.onclick = function () {
  if (el.src===heartSrc){
    el.src=heartFilledSrc
  } else {
    el.src=heartSrc;
  }
})