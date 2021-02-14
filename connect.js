// ================ Dependencies ======================

const mysql = require("mysql");
const inquirer = require("inquirer");

const displayAll = `SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, 
CONCAT(e.first_name, ' ' ,e.last_name) AS Manager 
FROM employee 
INNER JOIN role ON role.id = employee.role_id 
INNER JOIN department ON department.id = role.department_id 
left join employee e ON employee.manager_id = e.id;`;
displayByRoles = `SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id;`;
displayByDept = `SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;`;

//================= Set Up Database Connection =================
const connection = mysql.createConnection({
  port: 3306,

  user: "root",

  password: "chilmark",
  database: "employeeDB",
});

//================== Inquirer Prompts ====================

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  readProducts();
});

const readProducts = () => {
  console.log("Selecting all products... \n");
  connection.query(displayAll, (err, res) => {
    if (err) throw err;
    console.table(res);
    connection.end();
  });
};
