// BUDGET CONTROLLER
var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.des = description;
        this.val = value;
        this.percentage = -1
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.val / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var Income = function(id, description, value) {
        this.id = id;
        this.des = description;
        this.val = value;
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.val;
        });
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function(type, des, val) {
            var newItem, id;
            // Creating new id
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                id = 0;
            }
            // Creating new items
            if (type === "exp") {
                newItem = new Expense(id, des, val);
            } else if (type === "inc") {
                newItem = new Income(id, des, val);
            }
            // Push it into data structure
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            })
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            // carculate total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");
            
            // calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                console.log('Percentage ' + Math.round((data.totals.exp / data.totals.inc) * 100));
            } else {
                data.percentage = -1;
            }
        },
        getBudget: function () {
            return{
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            }
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        testing: function() {
            console.log(data);
        }
    }
})();

// UI CONTROLLLER
var UIController = (function() {
    var DOMstrings = {
        inputType: "#operators",
        inputDescription: "#description",
        inputValue: "#value",
        inpBtn: "#checkSign",
        incomeContainer: ".bodyForIncome",
        expenseContainer: ".bodyForExpense",
        budgetLabel: "#amount",
        incomeLabel: ".amountIncome",
        expenseLabel: ".amountExpense",
        percentageLabel: ".percentage",
        container: ".block1",
        expensesPercLabel: ".item__percentage",
        monthYearLabel: ".monthYear"
    }
    var formatNumber = function(num, type) {
        var numSplit, int, des;
        console.log(num);
        // + or - before number
        // exactly 2 decimal points
        // comma seperating the thousands   
        // 2310.4567 => + 2,310.46 (Round off)
        // 2000 => +2,000.00
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }
        des = numSplit[1];
        return (type === 'exp' ?  '-' :  '+') + ' ' + int + '.' + des; 
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        }, 
        addListItems: function(obj, type) {
            var html, newHtml, element;
            console.log(obj, type);
            if (type == "inc") {
                element = DOMstrings.incomeContainer;
                html = '<div class="item" id="inc-%id%"><div class="descriptionForBody">%description%</div><div class="amountDelete"><div class="amountForInc">%value%</div><div class="deleteBtnForInc"><i id="deleteBtn" class="im im-x-mark-circle-o"></i></div></div></div>' ;
            } else if (type == 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item" id="exp-%id%"><div class="descriptionForBody">%description%</div><div class="amountDelete"><div class="amountForExp">%value%</div><div class="item__percentage">21%</div><div class="deleteBtnForExp"><i id="deleteBtn" class="im im-x-mark-circle-o"></i></div></div></div>' ;
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.des);
            var i = formatNumber(obj.val, type);
            console.log(i);
            newHtml = newHtml.replace('%value%', i);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },
        clearFields: function () {
            var field, fieldsArr;
            field = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue)
            // console.log(field);
            fieldsArr = Array.prototype.slice.call(field);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        deleteListItem: function (seletorID) {
            var elem =  document.getElementById(seletorID);
            elem.parentNode.removeChild(elem);
        },
        displayBudget: function (obj) {
            var type
            obj.budget > 0 ? type = "inc" : type = "exp"
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber( obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, "inc");
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber (obj.totalExpense, "exp");
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            console.log(typeof(fields));
            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            })
        },
        displayMonth: function () {
            var now, year, month, months;
            now = new Date();
            months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.monthYearLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function () {
            
        },
        getDOMstring: function () {
            return DOMstrings;
        }
    }
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListners = function () {
        var DOM = UICtrl.getDOMstring();
        document.querySelector(DOM.inpBtn).addEventListener('click', ctrlAddItem);
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        // document.querySelector(DOM.inputType)addEventListener('change', changedType);
    }
    var updateBudget = function () {
        // 1. Calculate Budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget)
    }
    var updatePercentages = function () {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller 
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with new percentages
        // console.log(percentages);
        UICtrl.displayPercentages(percentages);
    }
    function ctrlAddItem () {
        var input, newItem;
        input = UICtrl.getInput()
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItems(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    }
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.id;
        // itemID = event.target.parentNode.parentNode.parentNode;
        console.log(itemID);
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    }
    return {
        init: function () {
            console.log("Application has started.");
            UICtrl.displayMonth();
            setupEventListners();
        }
    }
})(budgetController, UIController);
controller.init();