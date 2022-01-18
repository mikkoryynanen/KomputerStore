let currentBalance = 0;
let currentLoanBalance = 0;
let currentPay = 0;
let isLoanPaid = true;  // TODO can just check current loan balance, this would not be needed
let computers = []; //TODO Can be cleaned up?

const currentBalanceElement = document.getElementById("balance");
const loanContentElement = document.getElementById("loan-content");
const currentLoanBalanceElement = document.getElementById("loan-balance");
const currentPayElement = document.getElementById("pay");
const computerInfoElement = document.getElementById("computer-info");
const computersDropdownElement = document.getElementById("computers-dropdown");
const computersDropdownNameElement = document.getElementById("dropdown-selected");
const computersInfoNameElement = document.getElementById("info-computer-name");
const computersInfoElement = document.getElementById("info-computer");
const computersInfoPriceElement = document.getElementById("info-computer-price");
const computersInfoStockElement = document.getElementById("info-computer-stock");

const loanButton = document.getElementById("loan-button");
const payLoanButton = document.getElementById("pay-loan-button");
const bankButton = document.getElementById("bank-button");
const infoComputerBuyButton = document.getElementById("info-computer-buy-btn");

const computerImage = document.getElementById("computer-img");

currentBalanceElement.innerHTML = `${currentBalance} e`;
currentPayElement.innerHTML = `${currentPay} e`;

setButtonState(bankButton, false);
setElementVisibility(payLoanButton, false);
setElementVisibility(loanContentElement, false);

window.onload = async () => {
  const data = await (
    await fetch("https://noroff-komputer-store-api.herokuapp.com/computers")
    ).json();
    console.log(data);
    computers = data;
    
    // alway select the first element from the computer list when entering the page
    selectComputer(data[0]);
};

function selectComputer(selectedComputer) {
  const newList = computers.filter((c) => {
    return c !== selectedComputer;
  });

  clearElementChildren(computersDropdownElement);

  computersDropdownNameElement.innerHTML = selectedComputer.title;

  // Build computer list
  for (const computer of newList) {
    let li = generateElement("li");
    li.textContent = computer.title;
    li.addEventListener("click", () => {
      selectComputer(computer);
    });
    li.classList.add("list-group-item");
    li.classList.add("list-group-item-action");
    if (!computer.active) li.classList.add("disabled");

    li.style.cursor = "pointer";

    computersDropdownElement.appendChild(li);
  }

  clearElementChildren(computerInfoElement);

  // Build specs for currently selected computer
  selectedComputer.specs.map((info) => {
    let li = generateElement("li");
    li.textContent = info;
    computerInfoElement.appendChild(li);
  });

  // Build info panel
  computerImage.src = `https://noroff-komputer-store-api.herokuapp.com/${selectedComputer.image}`;
  computersInfoNameElement.innerHTML = selectedComputer.title;
  computersInfoElement.innerHTML = selectedComputer.description;
  computersInfoPriceElement.innerHTML = `${selectedComputer.price} e`;
  computersInfoStockElement.innerHTML = `Stock: ${selectedComputer.stock}`;

  infoComputerBuyButton.onclick = () => {
    onBuyComputer(selectedComputer.price, selectedComputer.stock);
  };

  setButtonState(infoComputerBuyButton, selectedComputer.stock > 0);
}

function onGetLoanPressed() {
  if (currentBalance > 0) {
    // TODO:
    // Add validation, only numbers should be allowed to be entererd

    if (!isLoanPaid) {
      alert(
        "You can only have one loan at a time. Pay it off before taking another one"
      );
    } else {
      let givenValue = prompt(
        `Please enter loan amount. Max load amount is ${currentBalance * 2}`
      );
      if (isNaN(givenValue)) {
        alert('Only numbers are allowed to be entered');
      } else {
        const loanAmount = parseInt(givenValue);
        if (loanAmount > 0) {
          if (loanAmount <= currentBalance * 2) {
            currentLoanBalance = loanAmount;
            isLoanPaid = false;

            currentBalanceElement.innerHTML = `${currentBalance} e`;
            currentLoanBalanceElement.innerHTML = `${currentLoanBalance} e`;

            setButtonState(loanButton, true);
            setElementVisibility(payLoanButton, true);
            setElementVisibility(loanContentElement, true);
          } else {
            alert("Cannot loan more than double your current bank balance");
          }
        } else {
          alert("Loan amount has to be more than 0");
        }
      }
    }
  } else {
    alert("You ned to have money to take up a loan");
  }
}

function onPayLoan() {
  // TODO validate that it is working.
  // Current pay balance should go to payig the loan
  // Anything that goes over, goes to your bank
  if (currentPay >= currentLoanBalance) {
    isLoanPaid = true;
    currentPay -= currentLoanBalance;
    currentLoanBalance = 0;

    setButtonState(loanButton, true);
    setElementVisibility(payLoanButton, false);
    setElementVisibility(loanContentElement, false);

    currentLoanBalanceElement.innerHTML = `0 e`;
    currentPayElement.innerHTML = `${currentPay} e`;
  } else {
    alert("Not enough money to pay for loan");
  }
}

function onWork() {
  currentPay += 100;
  currentPayElement.innerHTML = `${currentPay} e`;
  setButtonState(bankButton, true);
}

function onBankPayBalance() {
  if (currentPay > 0) {
    if (currentLoanBalance > 0) {
      // If user has loan, 10% of the salary goes to paying the loan when banking salary
      const loanPayment = 0.1 * currentPay;
      currentLoanBalance -= loanPayment;

      // TODO: Can be cleaned
      if (currentLoanBalance < 0) {
        currentLoanBalance = 0;
      }
      currentBalance += currentPay - loanPayment;
    } else {
      currentBalance += currentPay;
    }

    currentPay = 0;

    currentBalanceElement.innerHTML = `${currentBalance} e`;
    currentPayElement.innerHTML = `${currentPay} e`;
    currentLoanBalanceElement.innerHTML = `${currentLoanBalance} e`;

    setButtonState(bankButton, false);
  }
}

function onBuyComputer(price, stock) {
  // console.log(`currentBalance ${currentBalance} | price ${price}`);
  if (currentBalance >= price) {
    if (stock > 0) {
      currentBalance -= price;
      currentBalanceElement.innerHTML = `${currentBalance} e`;
      stock--;
      computersInfoStockElement.innerHTML = `Stock: ${stock}`;
      alert("You purchased a computer!");
    } else {
      alert("There is no stock");
    }
    setButtonState(infoComputerBuyButton, stock > 0);
  } else {
    alert("Not enough money to purchase laptop");
  }
}

//#region Helpers
function clearElementChildren(element) {
  while (element.firstChild) {
    element.firstChild.remove();
  }
}

function generateElement(element) {
  return document.createElement(element);
}

function setButtonState(button, state) {
  // button.style.cursor = !state ? "not-allowed" : 'pointer';
  if (!state) {
    button.setAttribute("disabled", "true");
  } else {
    button.removeAttribute("disabled");
  }
}

function setElementVisibility(element, state) {
  if (!state) {
    // element.setAttribute("hidden", "true");
    element.style.cssText = "display:none !important";
  } else {
    element.removeAttribute("hidden");
    element.style.display = "";
  }
}
//#endregion
