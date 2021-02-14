// ================ Dependencies ======================

const mysql = require("mysql");
const inquirer = require("inquirer");

const displayAllEmp = `SELECT employee.id, employee.First_Name, employee.Last_Name, role.Title, role.Salary, department.name AS department, 
CONCAT(e.first_name, ' ' ,e.last_name) AS Manager 
FROM employee 
INNER JOIN role ON role.id = employee.role_id 
INNER JOIN department ON department.id = role.department_id 
left join employee e ON employee.manager_id = e.id;`;
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
  startChoice();
});

//================== Inquirer Prompts ====================
function startChoice() {
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
          "Add Department",
          "Add Role",
          "Add Employee",
          "Update Employee Info",
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

        case "Add Department":
          addDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee Info":
          updateEmployee();
          break;
      }
    });
}

function viewAll() {
  console.log("\n View All Employee Info... \n");
  connection.query(displayAllEmp, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoice();
  });
}

function viewByDept() {
  console.log("\n View By Departments... \n");
  connection.query(displayByDept, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoice();
  });
}

function viewByManager() {
  console.log("\n View By Departments... \n");
  connection.query(displayByManager, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoice();
  });
}
