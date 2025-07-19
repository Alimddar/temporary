let authPart = document.querySelector("#content");
let btnLogin = document.querySelector("#btn-login");

let formBarIsAuth = `  <div class="isAuth form-bar">
              <div class="account-information">
                <a href="">
                  <i class="fa-solid fa-gift"></i>
                </a>
                <span class="username">
                  Xoş gəldin&nbsp;&nbsp; <b>Tunar</b>
                </span>
                <span class="balance"> Balans: &nbsp;&nbsp; <b>9$</b> </span>
              </div>
              <div class="button-group">
                <a href="./depozit.html" class="deposit">Depozit</a>
                <a href="" class="account">
                  <i class="fa-solid fa-user"></i>
                   Hesabım
                </a>
                <button class="sign-out">
                  <i class="fa-solid fa-power-off"></i>
                </button>
              </div>
            </div>`;

function checkAuth() {
  let isAuth = localStorage.getItem("isAuth");
  console.log("isAuth değeri:", isAuth);

  // String karşılaştırması yap
  if (isAuth === "true") {
    authPart.innerHTML = formBarIsAuth;
  } else {
    authPart.innerHTML = formBar;
  }
}

// Test fonksiyonları
function setAuth(value) {
  localStorage.setItem("isAuth", value.toString());
  checkAuth();
}

function login() {
  localStorage.setItem("isAuth", "true");
  checkAuth();
}

function logout() {
  localStorage.setItem("isAuth", "false");
  checkAuth();
}

// Sayfa yüklendiğinde kontrol et
window.onload = () => {
  checkAuth();
};
