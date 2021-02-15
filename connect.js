// ================ Dependencies ======================

const mysql = require("mysql");
const inquirer = require("inquirer");

const allFromEmployee = `Select * FROM employee`;
const displayAllEmp = `SELECT employee.id, employee.First_Name, employee.Last_Name, role.Title, role.Salary, department.name AS department, 
CONCAT(e.first_name, ' ' ,e.last_name) AS Manager 
FROM employee 
INNER JOIN role ON role.id = employee.role_id 
INNER JOIN department ON department.id = role.department_id 
left join employee e ON employee.manager_id = e.id
ORDER BY employee.id`;
const displayByManager = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS Manager, department.name AS Department,  employee.First_Name, employee.Last_Name, role.Title
FROM employee
LEFT JOIN employee manager on manager.id = employee.manager_id
INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
INNER JOIN department ON (department.id = role.department_id)
ORDER BY manager;`;
const displayByDept = `SELECT department.name AS Department, role.Title, employee.First_Name, employee.Last_Name
FROM employee
LEFT JOIN role ON role.id = employee.role_id
LEFT JOIN department ON (department.id = role.department_id)
ORDER BY department.name;`;

//================= Set Up Database Connection =================
const connection = mysql.createConnection({
  port: 3306,

  user: "root",

  password: "chilmark",
  database: "employeeDB",
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  startChoices();
});

//================== Inquirer Prompts ====================
function startChoices() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Choose from the list of options",
        name: "choice",
        choices: [
          "View All Employees",
          "View Employees By Department",
          "View Employees By Manager",
          "Add Employee",
          "Remove Employee",
          "Update Employee Role",
          "Update Employee Manager",
        ],
      },
    ])
    .then(function (res) {
      switch (res.choice) {
        case "View All Employees":
          viewAll();
          break;

        case "View Employees By Manager":
          viewByManager();
          break;

        case "View Employees By Department":
          viewByDept();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Update Employee Role":
          updateRole();
          break;

        case "Update Employee Manager":
          updateManager();
          break;
      }
    });
}

function viewAll() {
  console.log("\n View All Employee Info... \n");
  connection.query(displayAllEmp, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoices();
  });
}

function viewByDept() {
  console.log("\n View By Departments... \n");
  connection.query(displayByDept, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoices();
  });
}

function viewByManager() {
  console.log("\n View By Departments... \n");
  connection.query(displayByManager, (err, res) => {
    if (err) throw err;
    console.table(res);
    s();
  });
}

function addEmployee() {
  console.log("\n getting info ... \n");
  connection.query(displayAllEmp, async (err, res) => {
    if (err) throw err;
    let roleChoices = res
      .map((res) => res.Title)
      .reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
      }, []);
    let managerChoices = res.map((res) => `${res.First_Name} ${res.Last_Name}`);
    managerChoices.push("None");
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the Employee's first name?",
          name: "firstName",
        },
        {
          type: "input",
          message: "What is the Employee's last name?",
          name: "lastName",
        },
        {
          type: "input",
          message: "What is the Employee's last name?",
          name: "lastName",
        },
        {
          type: "list",
          message: "What is the Employee's Role?",
          name: "role",
          choices: roleChoices,
        },
        {
          type: "list",
          message: "Who is the Employees Manager?",
          name: "manager",
          choices: managerChoices,
        },
      ])
      .then(function (data) {
        let roleID;
        res.forEach((row) => {
          if (row.Title === data.role) roleID = row.id;
          return roleID;
        });

        let managerId;
        res.forEach((row) => {
          if (data.manager === "None") managerId = null;
          else if (`${row.First_Name} ${row.Last_Name}` === data.manager)
            managerId = row.id;
          return managerId;
        });

        connection.query(
          "INSERT INTO employee SET ?",
          {
            First_Name: data.firstName,
            Last_Name: data.lastName,
            role_id: roleID,
            manager_id: managerId,
          },
          (err, res) => {
            if (err) throw err;
            console.log(`${res.affectedRows} product inserted!\n`);
            startChoices();
          }
        );
      });
  });
}

function removeEmployee() {
  connection.query(displayAllEmp, async (err, res) => {
    if (err) throw err;
    let employeeChoices = res.map(
      (res) => `${res.First_Name} ${res.Last_Name}`
    );
    inquirer
      .prompt([
        {
          type: "list",
          name: "deleteEmployee",
          message: "Which Employee would you like to remove",
          choices: employeeChoices,
        },
      ])
      .then(function (data) {
        let employeeId;
        res.forEach((row) => {
          if (`${row.First_Name} ${row.Last_Name}` === data.deleteEmployee)
            return (employeeId = row.id);
        });
        connection.query(
          "DELETE FROM employee WHERE ?",
          {
            id: employeeId,
          },
          (err, res) => {
            if (err) throw err;
            console.log(`${res.affectedRows} products deleted!\n`);
            // Call readProducts AFTER the DELETE completes
            startChoices();
          }
        );
      });
  });
}
