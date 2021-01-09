const addTicketBtn = document.querySelector('.addTicketPopup');
const popupAddTicket = document.querySelector('.popupAddTicket');
const popupAddTicketClose = document.querySelector('.closeAddTicketPopup');
const popupAddTicketOk = document.querySelector('.addTicket');
const ticketListItem = document.querySelector('.ticketListItem');
const popupDeleteTicket = document.querySelector('.popupDeleteTicket');
const popupEditTicket = document.querySelector('.popupEditTicket');
const ticketListCont = document.querySelector('.ticketListCont');

let itemIdEdit;
let activeDescription = false;

addTicketBtn.addEventListener('click', () => {
  popupAddTicket.classList.remove('hide');
});

popupAddTicketClose.addEventListener('click', () => {
  popupAddTicket.classList.add('hide');
});

popupAddTicketOk.addEventListener('click', async (e) => {
  // сюда
  e.preventDefault();
  if (!document.getElementById('shortDisc').value) {
    alert('Введите корректное значение краткого описания');
    return;
  }
  const formData = new FormData();
  formData.id = null;
  formData.name = document.getElementById('shortDisc').value;
  formData.description = document.getElementById('longDisc').value;
  formData.status = false;
  formData.created = new Date().getTime();
  const response = await fetch('http://localhost:7070/?method=createTicket', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  updatePage();
  popupAddTicket.classList.add('hide');
});

async function updatePage() {
  ticketListCont.innerHTML = '';
  const method = 'allTickets';
  const response = await fetch(`http://localhost:7070/?method=${method}`);
  const data = await response.json();
  data.forEach((item) => {
    const date = new Date(Number.parseInt(item.created, 10));
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`;
    const day = `0${date.getDate()}`;
    const hours = `0${date.getHours()}`;
    const minutes = `0${date.getMinutes()}`;
    const seconds = `0${date.getSeconds()}`;
    const normalizeTime = `${day.substr(-2)}.${month.substr(-2)}.${year} ${hours.substr(-2)}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
    const element = document.createElement('li');
    element.classList.add('ticketListItem');
    element.setAttribute('data-id', item.id);
    element.innerHTML = `
      <input type="checkbox" class="checkboxList" id="${item.id}">
      <label for="${item.id}"></label>
      <div class="ticketListShortDisc">${item.name}</div>
      <div class="ticketListDate">${normalizeTime}</div>
      <div class="ticketListBtnCont">
        <div class="ticketListBtn ticketListRedact">&#9998</div>
        <div class="ticketListBtn ticketListDelete">&#9747</div>
      </div>
    `;
    ticketListCont.insertAdjacentElement('beforeend', element);
  });
  document.querySelectorAll('.ticketListItem').forEach((item) => {
    item.addEventListener('click', async (event) => {
      if (event.target.classList.contains('ticketListDelete')) {
        const itemId = item.getAttribute('data-id');
        popupDeleteTicket.classList.remove('hide');
        document.querySelector('.closeDeleteTicketPopup').addEventListener('click', () => {
          popupDeleteTicket.classList.add('hide');
        });
        document.querySelector('.deleteTicket').addEventListener('click', async () => {
          await fetch('http://localhost:7070/?method=deleteTicket', {
            method: 'POST',
            body: JSON.stringify(itemId),
          });
          popupDeleteTicket.classList.add('hide');
          updatePage();
        });
      }
      if (event.target.classList.contains('ticketListRedact')) {
        itemIdEdit = event.target.parentNode.parentNode.getAttribute('data-id');
        popupEditTicket.classList.remove('hide');
        document.querySelector('.closeEditTicketPopup').addEventListener('click', () => {
          popupEditTicket.classList.add('hide');
        });
        document.querySelector('.editTicket').addEventListener('click', async () => {
          if (!document.getElementById('shortDiscEdit').value) {
            alert('Введите корректное короткое описание для редактирования');
            return;
          }
          const formDataEdit = new FormData();
          formDataEdit.id = parseInt(itemIdEdit);
          formDataEdit.name = document.getElementById('shortDiscEdit').value;
          formDataEdit.description = document.getElementById('longDiscEdit').value;
          formDataEdit.status = false;
          formDataEdit.created = new Date().getTime();
          await fetch('http://localhost:7070/?method=editTicket', {
            method: 'POST',
            body: JSON.stringify(formDataEdit),
          });
          popupEditTicket.classList.add('hide');
          updatePage();
          return;
        });
      }
      if (event.target.classList.contains('ticketListItem') || event.target.classList.contains('ticketListShortDisc') || event.target.classList.contains('ticketListDate')) {
        const itemIdDescription = +item.getAttribute('data-id');
        const responsed = await fetch(`http://localhost:7070/?method=ticketById&id=${itemIdDescription}`);
        const data = await responsed.json();
        if (activeDescription) {
          if (document.querySelector('.ticketListDicription').previousElementSibling === item) {
            document.querySelector('.ticketListDicription').parentNode.removeChild(document.querySelector('.ticketListDicription'));
            activeDescription = false;
            return;
          } 
          document.querySelector('.ticketListDicription').parentNode.removeChild(document.querySelector('.ticketListDicription'));
          activeDescription = false;
        }
        const elementDiscription = document.createElement('div');
        elementDiscription.classList.add('ticketListDicription');
        elementDiscription.innerText = `${data.description}`;
        item.insertAdjacentElement('afterend', elementDiscription);
        activeDescription = true;
        return;
      }
      if (event.target.hasAttribute('for')) {
        let checkboxActive = document.querySelector('.checkboxList').checked;
        let checkBody = {};
        checkBody.id = item.getAttribute('data-id');
        console.log(checkBody);
        if (document.querySelector('.checkboxList').checked) {
          checkBody.status = false;
          await fetch(`http://localhost:7070/?method=checkStatus`, {
            method: 'POST',
            body: JSON.stringify(checkBody),
          });
        } else {
          checkBody.status = true;
          await fetch(`http://localhost:7070/?method=checkStatus`, {
            method: 'POST',
            body: JSON.stringify(checkBody),
          });
        }
      }
    });
  });
}

updatePage();
