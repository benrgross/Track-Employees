// ================ Dependencies ======================

const mysql = require("mysql");
const inquirer = require("inquirer");

const allFromEmployee = `Select * FROM employee`;
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

function addEmployee() {
  console.log("\n getting info ... \n");
  connection.query(displayAllEmp, async (err, res) => {
    if (err) throw err;
    let roleChoices = res.map((res) => res.Title);
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
      ])
      .then(function (data) {
        let firstName = data.firstName;
        let lastName = data.lastName;
        let roleID;
        res.forEach((row) => {
          if (row.Title === data.role) roleID = row.id;
          return roleID;
        });
        connection.query(
          "INSERT INTO employee SET ?",
          {
            Fist_Name: data.firstName,
            Last_Name: data.lastName,
            role_id: roleID,
            manager_id: 1,
          },
          (err, res) => {
            if (err) throw err;
            startChoice();
          }
        );
      });
  });
}
