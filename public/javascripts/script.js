document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);

// const $arrowLeft = document.getElementById('arrow-left');
// const $arrowRight = document.getElementById('arrow-right');
// const $imageDisplay = document.querySelector('.imageDisplay')
// const $allProductsImage = document.querySelectorAll('.product-img');
// const allImageSrcArray = Object.values($allProductsImage)
// const srcArray = allImageSrcArray.map(el=>el.currentSrc)

// $arrowLeft.onclick = function (){
//   let index = srcArray.indexOf($imageDisplay.src)
//   if (index===0){
//     index=srcArray.length-1
//   }
//   index--;
//   $imageDisplay.src=srcArray[index]
// }
// $arrowRight.onclick = function (){
//   let index = srcArray.indexOf($imageDisplay.src)
//   if (index===srcArray.length-1){
//     index=0
//   } 
//   index++;
//   $imageDisplay.src=srcArray[index]
// }

//PRODUCT DETAILS: Display each picture when clicking on the arrow left and right
const $mainImage = document.querySelector('.active')

const $sideImages = document.querySelectorAll('.inactive')

$sideImages.forEach(el=>el.onclick = function () {
    const replaceSrc = $mainImage.src;
    $mainImage.src=el.src
    el.src=replaceSrc;
})

//WISHLIST 
const overlay = document.createElement('div')
overlay.className ='overlay'
overlay.innerHTML=`
  <div class='overlay-content'>
  <p>Item added to wishlist!</p>
  <button class='btn topBtn'>CONTINUE SHOPPPING</button>
  <button class='btn bottomBtn'>GO TO WISHLIST</button>
  </div>
`
function on() {
  overlay.style.display = "block";
}

function off() {
  overlay.style.display = "none";
}
const heartSrc = 'https://res.cloudinary.com/vanbaotran/image/upload/v1623145410/photos/heart_jmddcq.png'
const heartFilledSrc ='https://res.cloudinary.com/vanbaotran/image/upload/v1623145429/photos/heart-filled_njjmsq.png'
const $heart = document.querySelectorAll('.heart');
$heart.forEach(el=>el.onclick = function () {
  if (el.src===heartSrc){
    el.src=heartFilledSrc;
    on()
  } else {
    el.src=heartSrc;
  }
})
