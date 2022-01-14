let currentBalance = 500;
let currentLoanBalance = 0;
let currentPay = 0;
let isLoanPaid = true;
let computers = [];

const currentBalanceElement = document.getElementById("balance");
const currentLoanBalanceElement = document.getElementById("loan-balance");
const currentPayElement = document.getElementById("pay");
const computerInfoElement = document.getElementById("computer-info");
const computersDropdownElement = document.getElementById("computers-dropdown");
const computersDropdownNameElement = document.getElementById("dropdown-selected");

const loanButton = document.getElementById("loan-button");
const payLoanButton = document.getElementById("pay-loan-button");
const bankButton = document.getElementById("bank-button");

const computerImage = document.getElementById("computer-img");

currentBalanceElement.innerHTML = `${currentBalance} e`;
currentPayElement.innerHTML = `${currentPay} e`;

setButtonState(bankButton, false);
setElementVisibility(payLoanButton, false);

window.onload = async () => {
  const data = await (
    await fetch("https://noroff-komputer-store-api.herokuapp.com/computers")
  ).json();
  console.log(data);
  computers = data;

  // alway select the first element from the computer list when entering the page
  selectComputer(data[0]);

  // Build selected computers features list
  data[0].specs.map((info) => {
    let li = generateElement("li");
    li.textContent = info;
    computerInfoElement.appendChild(li);
  });
};

function selectComputer(selectedComputer) {
  const newList = computers.filter((c) => {
    return c !== selectedComputer;
  });

  while (computersDropdownElement.firstChild) {
    computersDropdownElement.firstChild.remove();
  }

  computersDropdownNameElement.innerHTML = selectedComputer.title;

  for (const computer of newList) {
    // Build list of
    let li = generateElement("li");
    let button = generateElement("button");
    button.textContent = computer.title;
    button.addEventListener("click", () => {
      selectComputer(computer);
    });
    button.classList.add("btn-text");

    computersDropdownElement.appendChild(li);
    li.appendChild(button);
  }

  while (computerInfoElement.firstChild) {
    computerInfoElement.firstChild.remove();
  }

  // Build specs for currently selected computer
  selectedComputer.specs.map((info) => {
    let li = generateElement("li");
    li.textContent = info;
    computerInfoElement.appendChild(li);
  });

  // Build info panel
  computerImage.src = './assets/images/1.jpeg';
}

function onGetLoanPressed() {
  // TODO:
  // Add validation, only numbers should be allowed to be entererd

  if (!isLoanPaid) {
    console.error(
      "You can only have one loan at a time. Pay it off before taking another one"
    );
  } else {
    const loanAmount = parseInt(
      prompt(
        `Please enter loan amount. Max load amount is ${currentBalance * 2}`
      )
    );
    if (loanAmount > 0) {
      if (loanAmount <= currentBalance * 2) {
        currentLoanBalance = loanAmount;
        isLoanPaid = false;

        currentBalanceElement.innerHTML = `${currentBalance} e`;
        currentLoanBalanceElement.innerHTML = `${currentLoanBalance} e`;

        loanButton.setAttribute("disabled", "true");
        setElementVisibility(payLoanButton, true);
      } else {
        console.error("Cannot loan more than double your current bank balance");
      }
    } else {
      console.error("Loan amount has to be more than 0");
    }
  }
}

function onPayLoan() {
  if (currentPay >= currentLoanBalance) {
    isLoanPaid = true;
    currentPay -= currentLoanBalance;
    currentLoanBalance = 0;

    setButtonState(loanButton, true);
    setElementVisibility(payLoanButton, false);

    currentLoanBalanceElement.innerHTML = `0 e`;
    currentPayElement.innerHTML = `${currentPay} e`;
  } else {
    console.error("Not enough money to pay for loan");
  }
}

function onWork() {
  currentPay += 100;
  currentPayElement.innerHTML = `${currentPay} e`;
  setButtonState(bankButton, true);
}

function onBankPayBalance() {
  if (currentPay > 0) {
    // If user has loan, 10% of the salary goes to paying the loan when banking salary
    const loanPayment = 0.1 * currentPay;
    currentLoanBalance -= loanPayment;

    // TODO: Can be cleaned
    if (currentLoanBalance < 0) {
      currentLoanBalance = 0;
    }

    currentBalance += currentPay - loanPayment;

    currentPay = 0;

    currentBalanceElement.innerHTML = `${currentBalance} e`;
    currentPayElement.innerHTML = `${currentPay} e`;
    currentLoanBalanceElement.innerHTML = `${currentLoanBalance} e`;

    setButtonState(bankButton, false);
  }
}

//#region Helpers
// function updateBalance(balanceToAdd) {
//   currentBalance += balanceToAdd;
//   currentBalanceElement.innerHTML = `${currentBalance} e`;
// }

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
    element.setAttribute("hidden", "true");
  } else {
    element.removeAttribute("hidden");
  }
}
//#endregion
