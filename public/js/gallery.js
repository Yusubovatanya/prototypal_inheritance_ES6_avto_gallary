const fieldUrl = document.getElementById("inputUrl");
const fieldName = document.getElementById("inputName");
const fieldId = document.getElementById("inputId");
const fieldDescription = document.getElementById("inputDescription");
const fieldDay = document.getElementById("inputDay");
const fieldMonth = document.getElementById("inputMonth");
const fieldYear = document.getElementById("inputYear");
const btnGroupeEdit = document.getElementById("btnGroupeEdit");
const btnGroupeCreate = document.getElementById("btnGroupeCreate");
const btnSaveForm = document.getElementById("saveForm");
const boxForm = document.getElementById('boxFormEdit');
const btnAddNewElement = document.getElementById("add");
const btnCloseForm = document.getElementById("closeForm");
const btnCreateElement = document.getElementById("saveFormCreate");
const btnCloseFormCreate = document.getElementById("closeFormCreate");
const result = document.querySelector('#result');
const count = document.querySelector('#count');
const changeSelect = document.getElementById('line-selector');

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});


class BaseGallery {
    constructor() {
        this.visibleItem = [];
        this.list = null;
        this.editElement = {};
        this.formObject = {};
    }

    changeName(oldName) {
        oldName = oldName.trim();
        return oldName = ((oldName)[0]).toUpperCase() + ((oldName).slice(1)).toLowerCase();
    }

    changeUrl(oldUrl) {
        return oldUrl = (oldUrl.startsWith("http://")) ?
            oldUrl :
            "http://" + oldUrl;
    }

    changeDescription(oldDescription) {
        if ((oldDescription).length > 15) {
            return oldDescription = oldDescription.substr(0, 15) + "...";
        }
        return oldDescription;
    }

    changeDate(oldDate) {
        oldDate = parseInt(oldDate);
        if (Number.isNaN(oldDate) === true) {
            oldDate = +new Date(oldDate);
        }
        if (window.moment) {
            return oldDate = moment(oldDate).format('YYYY/MM/DD h:mm');
        } else {
            return oldDate = `${oldDate.getFullYear()}/\
            ${formatValueDate(oldDate.getMonth(), 1)}/\
            ${formatValueDate(oldDate.getDate())} \
            ${oldDate.getHours()}:\
            ${oldDate.getMinutes()}`;

            function formatValueDate(item, value = 0) {
                item = (item < 10 - value) ?
                    `0${item + value}` :
                    `${item}`;
            }
        }
    }

    transformList(data) {
        return data.map(item => {
            return {
                url: this.changeUrl(item.url),
                name: this.changeName(item.name),
                id: item.id,
                description: this.changeDescription(item.description),
                timeStamp: item.date,
                date: this.changeDate(item.date)
            }
        })
    }

    sortGallery(visibleItem) {
        let key;
        let direction = 1;

        function sortMethod(a, b) {

            if (a[key] > b[key]) {
                return direction;
            } else if (a[key] < b[key]) {
                return -direction;
            } else {
                return 0;
            }
        }

        switch (changeSelect.value) {
            case "1":
                key = "name";
                direction = 1;
                return visibleItem.sort(sortMethod);
            case "2":
                key = "name";
                direction = -1;
                return visibleItem.sort(sortMethod);
            case "3":
                key = "timeStamp";
                direction = -1;
                return visibleItem.sort(sortMethod);
            case "4":
                key = "timeStamp";
                direction = 1;
                return visibleItem.sort(sortMethod);
        }
    }

    countItems(item) {
        count.innerHTML = item.length;
    }

    renderGallery(list) {

        let secondItemTemplate = "";

        list.forEach(item => {
            secondItemTemplate += `<div class="card box-shadow text-center justify-content-between card_item" style="margin: 15px; padding: 0">\
            <div class="img_card" style="background: url(${item.url}) no-repeat center/cover;"></div>\
            <div class="card-info">\
            <div class="text-muted text-center h5">${item.name}</div>\
            <div class="text-muted top-padding text-center">${item.description}</div>\
            <div class="text-muted text-center">${item.date}</div>\
            <div class="btn-group" role="group">\
            <button data-target="btnEdit" data-id="${item.id}" type="button" class="btn btn-outline-secondary" style="margin-top: 10px;">Edit</button>\
            <button id="btnDel" class="btn btn-danger" class = "del" data-id="${item.id}" style="margin-top: 10px;">Удалить</button>\
            </div>\
            </div>\
            </div>`;

        });
        result.innerHTML = secondItemTemplate;
    }


    setSortValueToLocalStorage() {
        localStorage.setItem('valueOfMethodSort', changeSelect.value);
    }

    setSortValueFromLocalStorage() {
        changeSelect.value = (localStorage.getItem('valueOfMethodSort')) ?
            localStorage.getItem('valueOfMethodSort') :
            "1";
        console.log(changeSelect.value)
    }

    getDataElements() {
        fetch("http://localhost:3000/cars").then(response => response.json())
            .then(data => {
                this.list = data;
                this.visibleItem = this.transformList(this.list);
                this.sortGallery(this.visibleItem);
                this.renderGallery(this.visibleItem);
                this.countItems(this.visibleItem);
            })
    }

    initComponent() {
        this.setSortValueFromLocalStorage();
        this.getDataElements();
        this.initListener();
    }

    initListener() {
        changeSelect.addEventListener('change', () => {
            this.sortGallery(this.visibleItem);
            this.renderGallery(this.visibleItem);
            this.setSortValueToLocalStorage();
        });
    }
}

class ExtendedGallery extends BaseGallery {

    initComponentListener() {
        super.initComponent();

        btnCloseForm.addEventListener("click", (e) => {
            this.showOrHideForm("hide");
            document.getElementById("go_groupe_btn").style.visibility = "visible";
        });

        btnSaveForm.addEventListener("click", (e) => {
            this.initComponentUpdateElement();
        });

        btnAddNewElement.addEventListener("click", (e) => {
            this.clearFieldsForm();
            this.showOrHideForm("show");
            this.showOrHideGroupeBtn("create");
        });

        result.addEventListener("click", (event) => {
            if (event.target.getAttribute("data-target") == "btnEdit") {
                this.showOrHideForm("show");
                this.showOrHideGroupeBtn("edit");
                this.initEditComponent();
            } else {
                this.deleteItemGallery();
            }
        });

        btnCloseFormCreate.addEventListener("click", (e) => {
            this.showOrHideForm("hide");
            document.getElementById("go_groupe_btn").style.visibility = "visible";
        });

        btnCreateElement.addEventListener("click", (e) => {
            this.initComponentCreateElement();
        });
    }

    deleteItemGallery() {
        if (!event.target.getAttribute("data-id")) {
            return;
        }
        let idDelElement = event.target.getAttribute("data-id");
        if (idDelElement) {
            if (this.showConfirm()) {
                this.initDeleteItem(idDelElement);
            }
        }
    }

    initEditComponent() {
        if (!event.target.getAttribute("data-id")) {
            return;
        }
        let idEditElement = event.target.getAttribute("data-id");
        if (idEditElement) {
            this.defineEditElement(idEditElement);
            this.renderEditForm();
        }
    }

    initComponentUpdateElement() {
        this.getFieldsForm();
        this.createFormObject();
        if (validDateForm.mainValidFormNewElement(this.formObject)) {
            this.transformFormatDate();
            this.updateElements();
        } else {
            return;
        }
    }

    initComponentCreateElement() {
        this.getFieldsForm();
        this.createFormObject();
        if (validDateForm.mainValidFormNewElement(this.formObject) && validDateForm.validFieldId(this.formObject, this.visibleItem)) {
            this.transformFormatDate();
            this.postNewElement(this.editElement);
        } else {
            return;
        }
    }

    getFieldsForm() {
        this.editElement.url = fieldUrl.value;
        this.editElement.name = fieldName.value;
        this.editElement.id = fieldId.value;
        this.editElement.description = fieldDescription.value;
        this.editElement.date = moment(this.editElement.date).format("x");
        this.editElement.timeStamp = this.editElement.date;
        return this.editElement;
    }

    updateElements() {
        let linkItem = "http://localhost:3000/cars/" + this.editElement.id;
        const options = {
            method: 'put',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(this.editElement)
        }

        fetch(linkItem, options).then(responce => responce.json())
            .then(() => {
                this.showAlert("edit");
                this.getDataElements();
            })
    }

    defineEditElement(idEditElement) {
        let index = this.visibleItem.indexOf(this.visibleItem.filter(element => element.id == idEditElement)[0]);
        this.editElement = this.visibleItem[index];
    }

    renderEditForm() {
        fieldUrl.value = this.editElement.url;
        fieldName.value = this.editElement.name;
        fieldId.value = this.editElement.id;
        fieldDescription.value = this.editElement.description;
        fieldYear.value = moment(this.editElement.date).format('YYYY');
        fieldMonth.value = moment(this.editElement.date).format('MM');;
        fieldDay.value = moment(this.editElement.date).format('DD');;
    }

    clearFieldsForm() {
        var fields = boxForm.querySelectorAll('input');
        for (var i = 0; i < fields.length; i++) {
            fields[i].value = "";
        }
    }

    showAlert(status) {
        let msg = "";
        switch (status) {
            case "edit":
                msg = "Данные успешно сохранены";
                break;
            case "create":
                msg = "Новый элемент был успешно сохранен";
                break;
            case "delete":
                msg = "Элемент был успешно удален";
                break;
            default:
        }
        document.getElementById("resultBodyModal").innerHTML = msg;
        $("#resultModal").modal('show');
    }

    showConfirm() {
        return confirm("Вы действительно хотите удалить элемент?");
    }

    postNewElement(newElement) {
        let linkItem = "http://localhost:3000/cars";
        const options = {
            method: 'post',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(newElement)
        }
        fetch(linkItem, options).then(responce => responce.json())
            .then(data => {
                this.showAlert("create");
                this.getDataElements();
                this.showOrHideForm("hide");
            })
    }

    transformFormatDate() {
        let formatDate = `${fieldYear.value}-${fieldMonth.value}-${fieldDay.value}`;
        this.editElement.date = moment(formatDate).format("x");
    }

    showOrHideForm(status) {
        document.getElementById("go_groupe_btn").style.visibility = "hidden";
        switch (status) {
            case "show":
                boxGallery.style.display = 'none';
                boxForm.style.display = 'block';
                break;
            case "hide":
                boxGallery.style.display = 'block';
                boxForm.style.display = 'none';
                break;
            default:
        }
    }

    initDeleteItem(idDelElement) {
        let linkItem = "http://localhost:3000/cars/" + idDelElement;
        const options = {
            method: 'delete',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(this.editElement)
        }

        fetch(linkItem, options).then(responce => responce.json())
            .then(data => {
                this.getDataElements();
                this.showAlert("delete");
                this.showOrHideForm("hide");
            })
    }

    showOrHideGroupeBtn(status) {
        switch (status) {
            case "create":
                btnGroupeCreate.style.display = 'block';
                btnGroupeEdit.style.display = 'none';
                fieldId.removeAttribute('readonly');
                break;
            case "edit":
                btnGroupeCreate.style.display = 'none';
                btnGroupeEdit.style.display = 'block';
                fieldId.setAttribute("readonly", 'readonly');
                break;
            default:
        }
    }

    createFormObject() {
        this.formObject = {
            year: fieldYear.value,
            month: fieldMonth.value,
            day: fieldDay.value,
            id: fieldId.value,
            box: boxForm
        }
    }

}

//validation date and id creating new element 

function ValidDateForm() {

    let showAlertErrors = (status) => {
        let msg = "";
        switch (status) {
            case "error":
                msg = "Введите корректную дату ";
                break;
            case "errorFull":
                msg = "Заполните все поля формы";
                break;
            case "errorId":
                msg = "Элемент с таким id уже существует";
                break;
            default:
        }
        // alert(msg);
        document.getElementById("resultBodyModal").innerHTML = msg;
        $("#resultModal").modal('show');
    }

    let validDate = (formObject) => {
        if (formObject.year <= moment().year()) {
            if (formObject.month <= 12 && formObject.month !== 0) {
                if (moment(`${formObject.year}-${formObject.month}`, "YYYY-MM").daysInMonth() >= formObject.day) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    let validFullFieldsNewElement = (formObject) => {
        var res = "";
        var fields = (formObject.box).querySelectorAll('input');
        for (var i = 0; i < fields.length; i++) {
            if (!fields[i].value.length) {
                return false;
            } else {
                res = true;
            }
        }
        return res;
    }

    this.mainValidFormNewElement = function (formObject) {
        if (validFullFieldsNewElement(formObject) == true) {
            if (validDate(formObject) == true) {
                return true;
            } else {
                showAlertErrors("error");
                return false;
            }
        } else {
            showAlertErrors("errorFull");
            return false;
        }
    }

    this.validFieldId = (formObject, visibleItem) => {
        let res = "";
        visibleItem.forEach(item => {
            if (formObject.id == item.id) {
                showAlertErrors("errorId");
                res = false;
            } else {
                res = true;
            }
        })
        return res;
    }
}