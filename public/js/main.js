const btnSingIn = document.getElementById("singIn");
const valueFieldEmail = document.getElementById("inputEmail");
const valueFieldPassword = document.getElementById("inputPassword");
const boxSignIn = document.getElementById("formSignIn");
const boxUser = document.getElementById("userPage");
const btnVisiblePass = document.getElementById('showPassword');
const btnBack = document.getElementById("back");
const msgAlertFullFields = document.querySelector("#my_alert");
const userMenu = document.getElementById("menu");
const login_page = document.getElementById("login_page");
const btnGallery = document.getElementById("go_gallery");
const btnAboutUser = document.getElementById("go_about_user");
const btnExit = document.getElementById("go_exit");
const boxGallery = document.getElementById('gallery');

class Validator {

    showOrHideAlert(status, information) {
        switch (status) {
            case "visible":
                msgAlertFullFields.style.visibility = 'visible';
                msgAlertFullFields.innerHTML = information;
                break;
            case "hide":
                msgAlertFullFields.style.visibility = 'hidden';
                break;
            case "show":
                msgAlertFullFields.style.visibility = 'hidden';
                msgAlertFullFields.style.display = "";
                break;
            case "none":
                msgAlertFullFields.style.visibility = "";
                msgAlertFullFields.style.display = "none";
                break;
            default:
        }
    }

    checkFullField(emailValue, passwordValue) {
        if (emailValue.length == 0 || passwordValue.length == 0) {
            this.showOrHideAlert("visible", "Заполните все поля логина и пароля !");
            setTimeout(this.showOrHideAlert, 5000, "hide");
            return false;
        } else {
            return true;
        }
    }

    validateEmail(status, emailValue) {
        if (status == true) {
            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            if (reg.test(emailValue) == false) {
                this.showOrHideAlert("visible", "Пожалуйста, введите корректный адрес электронной почты !");
                setTimeout(this.showOrHideAlert, 5000, "hide");
                return false;
            } else {
                return true;
            }
        }
        return;
    }

    validatePassword(status, passwordValue) {
        if (status == true) {
            if (passwordValue.length < 8) {
                this.showOrHideAlert("visible", "Пароль должен содержать не менее 8 символов. Пожалуйста, введите корректный пароль!");
                setTimeout(this.showOrHideAlert, 3000, "hide");
                return false;
            } else {
                return true;
            }
        }
    }

    isValid(email, password) {
        let resultValidFields = this.checkFullField(email, password);
        let resultValidateEmail = this.validateEmail(resultValidFields, email);
        let resultValidatePassword = this.validatePassword(resultValidateEmail, password);
        return resultValidatePassword;
    }
}

class LoginForm {
    constructor(validatorModule, galleryModule) {
        this.validator = validatorModule;
        this.gallery = galleryModule;
        this.listBtn = [btnGallery, btnAboutUser, btnExit];
        this.boxes = [boxGallery, boxSignIn, boxUser];
        this.pwShown = true;
        this.email = "";
        this.password = "";
    }

    makeTrimFields(valueTrim) {
        return valueTrim.trim();
    }

    initComponent() {
        if (localStorage.getItem('status') === "authorization") {
            this.init();
        } else {
            btnSingIn.addEventListener("click", (event) => {
                event.preventDefault();
                this.mainValid();
            });
        }
    }

    hidePassword() {
        document.getElementById("getPassword").type = "password";
    }

    showPassword(passwordValue) {
        document.getElementById("getPassword").type = passwordValue;
        document.getElementById("getPassword").type = "text";
    }

    showBox(status) {
        let box = "";
        let btn = "";
        switch (status) {
            case "gallery":
                btn = btnGallery;
                box = boxGallery;
                break;
            case "aboutUser":
                btn = btnAboutUser
                box = boxUser;
                break;
            case "exit":
                box = boxSignIn;
                break;
            default:
        }

        this.listBtn.forEach(element => {
            if (element === btn) {
                element.classList.remove("btn-outline-primary");
                element.classList.add("btn-primary");
            } else {
                element.classList.remove("btn-primary");
                element.classList.add("btn-outline-primary");
            }

        });

        this.boxes.forEach(element => {
            if (element === box) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }

        })
    }

    initPageAboutUser() {

        fetch("/user")
            .then(response => response.json())
            .then(user => {
                document.getElementById("getEmail").value = user.login;
                document.getElementById("getPassword").value = user.password;
                btnVisiblePass.addEventListener("click", (e) => {
                    if (this.pwShown) {
                        this.pwShown = !(this.pwShown);
                        this.showPassword();
                        btnVisiblePass.innerHTML = "Скрыть пароль";
                    } else {
                        this.pwShown = !(this.pwShown);
                        this.hidePassword();
                        btnVisiblePass.innerHTML = "Показать пароль";
                    }
                });
            })
    }

    initListenersUserMenu() {

        btnGallery.addEventListener('click', (event) => {
            this.showBox("gallery");
        })

        btnAboutUser.addEventListener('click', (event) => {
            this.pwShown = true;
            this.hidePassword();
            btnVisiblePass.innerHTML = "Показать пароль";
            this.showBox("aboutUser");
        })

        btnExit.addEventListener('click', (event) => {
            this.exitFromUserPage();
            this.hideUserMenu();
        })
    }

    showUserMenu() {
        userMenu.style.display = 'block';
        this.showOrHideLoginPage("hide");
    }

    hideUserMenu() {
        userMenu.style.display = 'none';
        this.showOrHideLoginPage("show");
    }

    showOrHideLoginPage(status) {
        switch (status) {
            case "show":
                login_page.style.display = 'block';
                break;
            case "hide":
                login_page.style.display = 'none';
                break;
            default:
        }
    }

    mainValid() {
        this.email = this.makeTrimFields(valueFieldEmail.value);
        this.password = this.makeTrimFields(valueFieldPassword.value);
        if (this.validator.isValid(this.email, this.password)) {
            this.authorization(this.email, this.password);
        }
    }

    authorization(email, password) {
        let valueAuthorization = {
            login: email,
            password: password
        }
        let linkItem = "http://localhost:3000/user";
        const options = {
            method: 'post',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(valueAuthorization)
        }

        fetch(linkItem, options).then(response => {
                if (response.status !== 200) {
                    return Promise.resolve({
                        status: false
                    });
                }
                return response.json();
            })
            .then(result => {
                if (result.status) {
                    localStorage.setItem("status", "authorization");
                    this.init();
                } else {
                    this.validator.showOrHideAlert("visible", "Введен неверный логин или пароль !");
                    setTimeout(this.validator.showOrHideAlert, 3000, "hide");
                }
            })
            .catch(err => {
                console.error(err);
            })
    }

    init() {
        this.initListenersUserMenu();
        this.showUserMenu();
        this.gallery.initComponentListener();
        this.initPageAboutUser();
        this.showBox("gallery");
        this.validator.showOrHideAlert("none");
    }

    exitFromUserPage() {
        this.showBox("exit");
        this.hideUserMenu();
        this.validator.showOrHideAlert("show");
        valueFieldEmail.value = "";
        valueFieldPassword.value = "";
        localStorage.clear();
    }
}

let validatorModule = new Validator();
let galleryModule = new ExtendedGallery();
let validDateForm = new ValidDateForm();
let loginFormModule = new LoginForm(validatorModule, galleryModule);

loginFormModule.initComponent();