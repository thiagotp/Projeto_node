class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {
        this.form = document.getElementById(formIdCreate)
        this.formUpdate = document.getElementById(formIdUpdate)
        this.table = document.getElementById(tableId)
        this.eventSubmit()
        this.eventEdit()
        this.selectAll()
    }


    eventEdit() {

        let btnCancel = document.querySelector('#box-user-update .btn-cancel')

        btnCancel.addEventListener('click', (event) => {
            document.querySelector('#form-user-update').reset()
            this.ShowFormCreate()
        })

        this.formUpdate.addEventListener("submit", (event) => {

            event.preventDefault();
            let btnSubmit = this.formUpdate.querySelector('[type=submit]')
            let values = this.getFormValues(this.formUpdate);
            let index = this.formUpdate.dataset.trIndex
            let tr = this.table.rows[index]
            let oldUser = JSON.parse(tr.dataset.user)
            let updatedUser = Object.assign({}, oldUser, values)


            this.getPhoto(this.formUpdate).then((content) => {

                if (!values._photo) {

                    updatedUser._photo = oldUser._photo

                } else {

                    updatedUser._photo = content

                }

                let user = new User()

                user.loadFromJSON(updatedUser)
                user.saveUser().then(user => {

                    tr = this.trHTML(user, tr)

                    this.updateCountUsers()
                    this.formUpdate.reset();
                    btnSubmit.disabled = false;

                });

            }, (e) => {

                console.error(e);

            })

            this.ShowFormCreate()

        })

    }//Função que irá editar e substituir a linha na tabela com dados novos do usuário

    ShowFormUpdate() {

        document.querySelector('#box-user-create').style.display = 'none'
        document.querySelector('#box-user-update').style.display = 'block'

    }//trocando exibição de formulários

    ShowFormCreate() {

        document.querySelector('#box-user-create').style.display = 'block'
        document.querySelector('#box-user-update').style.display = 'none'

    }//trocando exibição de formulários

    eventSubmit() {

        let btnSubmit = this.form.querySelector('[type=submit]')

        this.form.addEventListener("submit", (e) => {
            e.preventDefault()
            let values = this.getFormValues(this.form);
            if (!values) {

                btnSubmit.disabled = false;

            } else {

                btnSubmit.disabled = true;

            }
            this.getPhoto(this.form).then((content) => {

                values.photo = content;
                values.saveUser().then(user => {

                    this.addListLine(user);
                    this.form.reset();
                    btnSubmit.disabled = false;

                });

            }, (e) => {

                console.error(e);

            })
        })

    }//Fechando a função que irá adicionar o evento de envio do formulário

    getPhoto(form) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();
            let elements = [...form.elements].filter(item => {
                if (item.name === 'photo') {
                    return item;
                }
            })

            let file = elements[0].files[0];
            fileReader.onload = () => {

                resolve(fileReader.result)

            }

            fileReader.onerror = (e) => {
                reject(e);
            }
            if (file) {
                fileReader.readAsDataURL(file)
            } else {
                resolve('dist/img/unisex.jpg')
            }

        })

    }//Fechando função que interpreta a photo do formulário

    //Nessa função usamos o Spread para que uma coleção seja entendida como um array
    getFormValues(form) {

        let user = {};
        let isValid = true;

        [...form.elements].forEach((field, index) => {
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {

                field.parentElement.classList.add('has-error')
                isValid = false

            } else {

                field.parentElement.classList.remove('has-error')

            }

            if (field.name === "gender") {

                if (field.checked) user[field.name] = field.value

            } else if (field.name === "admin") {

                user[field.name] = field.checked

            } else {

                user[field.name] = field.value

            }
        })

        if (isValid) {
            return new User(
                user.name,
                user.gender,
                user.birth,
                user.country,
                user.email,
                user.password,
                user.photo,
                user.admin,
                user.register
            )
        } else {
            return false
        }

    }//Fechando a função que irá pegar os valores dos campos do formulário e rotarna um JSON com eles

    selectAll() {

        //let users = User.getUsersStorage();

        HttpRequest.get("/users").then(data => {

            data.users.forEach(dataUser => {

                let user = new User();
                user.loadFromJSON(dataUser)
                this.addListLine(user)

            })

        })


    }

    addListLine(dataUser) {

        let tr = this.trHTML(dataUser)

        this.table.appendChild(tr)

        this.updateCountUsers()

    }//Fechando função que irá adicionar uma linha na tabela com os dados do usuário

    trHTML(dataUser, tr = null) {

        if (tr === null) tr = document.createElement('tr')

        //transformando um objeto em string
        tr.dataset.user = JSON.stringify(dataUser)

        tr.innerHTML = `
        <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
        <td>${dataUser.name}</td>
        <td>${dataUser.email}</td>
        <td>${(dataUser.admin) ? 'Sim' : "Não"}</td>
        <td>${Utils.dateFormat(dataUser.register)}</td>
        <td>
            <button type="button" class="btn btn-primary btn-xs btn-edit btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-xs btn-delete btn-flat">Excluir</button>
        </td>
    `

        this.addEventsTr(tr);

        return tr;

    }// Responsável por gerar a tr da tabela

    addEventsTr(tr) {

        tr.querySelector('.btn-edit').addEventListener('click', (event) => {

            let lineJson = JSON.parse(tr.dataset.user)

            this.formUpdate.dataset.trIndex = tr.sectionRowIndex

            for (let name in lineJson) {

                let field = this.formUpdate.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {
                    switch (field.type) {

                        case 'file':
                            continue;
                            break;

                        case 'radio':
                            field = this.formUpdate.querySelector("[name=" + name.replace("_", "") + "][value=" + lineJson[name] + "]")
                            field.checked = true;
                            break;

                        case 'checkbox':
                            field.checked = lineJson[name]
                            break;

                        default:
                            field.value = lineJson[name]

                    }

                }

            }

            this.formUpdate.querySelector('.photo').src = lineJson._photo

            this.ShowFormUpdate()

        })


        tr.querySelector('.btn-delete').addEventListener('click', (event) => {

            if (confirm("Deseja realmente excluir? ")) {

                let user = new User()
                user.loadFromJSON(JSON.parse(tr.dataset.user))
                user.remove()
                tr.remove();
                this.updateCountUsers();

            }

        })

    }//Adicionando eventos nos botões da tabela de usuários

    updateCountUsers() {

        let users = 0;
        let admins = 0;
        let userCount = document.querySelector('#number-users');
        let adminCount = document.querySelector('#number-admin');
        [...this.table.children].forEach(tr => {
            //transformando uma string em objeto JSON
            let user = JSON.parse(tr.dataset.user)
            if (user._admin) {
                admins++
            } else {
                users++
            }

        })

        userCount.innerHTML = users
        adminCount.innerHTML = admins

    }//Contador de usuários

}