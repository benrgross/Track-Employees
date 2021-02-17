// ================ Dependencies ======================

const mysql = require("mysql");
const inquirer = require("inquirer");
var figlet = require("figlet");

// Selection for all employees with id, first name, last name, title, salary, department, and manager
const displayAllEmp = `SELECT employee.id, employee.First_Name, employee.Last_Name, role.Title, role.Salary, department.name AS department, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id left join employee e ON employee.manager_id = e.id ORDER BY employee.id`;
// display employees by their managers
const displayByManager = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS Manager, department.name AS Department,  employee.First_Name, employee.Last_Name, role.Title
FROM employee
LEFT JOIN employee manager on manager.id = employee.manager_id
INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
INNER JOIN department ON (department.id = role.department_id)
ORDER BY manager;`;
// display employees by department.
const displayByDept = `SELECT department.name AS Department, role.Title, employee.First_Name, employee.Last_Name
FROM employee
LEFT JOIN role ON role.id = employee.role_id
LEFT JOIN department ON (department.id = role.department_id)
ORDER BY department.name;`;
const displayRole = `SELECT * FROM role`;
const displayEmpByRole = `  SELECT role.Title, role.id, employee.First_Name, employee.Last_Name FROM role left join employee on role.id = employee.role_id;`;
const displayUtilBudget = `SELECT department.id, department.name AS Department,  SUM(salary) AS Utilized_Budget FROM  role INNER JOIN department ON (department.id = role.department_id) GROUP BY  department_id;`;
//================= Set Up Database Connection =================
const connection = mysql.createConnection({
  port: 3306,

  user: "root",

  password: "password",
  database: "employeeDB",
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  welcome();
});

//================== Inquirer Prompts ====================

const welcome = () => {
  figlet("Welcome to Employee Tracker!!!", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
    startChoices();
  });
};

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
          "View All Roles",
          "View Total Utilized Budgets of Departments",
          "Add Employee",
          "Add New Title",
          "Remove Employee",
          "Remove Title",
          "Update Employee Role",
          "Update Employee Manager",
          "Exit Application",
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

        case "Add New Title":
          addRole();
          break;

        case "View All Roles":
          displayRoles();
          break;

        case "Remove Title":
          removeRole();
          break;
        case "View Total Utilized Budgets of Departments":
          viewUtilBudget();
          break;
        case "Exit Application":
          exitApp();
          break;
      }
    });
}

// displays table by employee with first name, last name, title, department, salary and manager
function viewAll() {
  console.log("\n View All Employee Info... \n");
  connection.query(displayAllEmp, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoices();
  });
}

// displays data by department with employees names and postilions
function viewByDept() {
  console.log("\n View By Departments... \n");
  connection.query(displayByDept, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoices();
  });
}

// view employees by their manager
function viewByManager() {
  console.log("\n View ByManager... \n");
  connection.query(displayByManager, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoices();
  });
}

function displayRoles() {
  console.log("\n View All Titles... \n");
  connection.query(displayRole, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoices();
  });
}

function viewUtilBudget() {
  console.log("\n View Utilized Bidget By Department... \n");
  connection.query(displayUtilBudget, (err, res) => {
    if (err) throw err;
    console.table(res);
    startChoices();
  });
}

// add employee to the database
function addEmployee() {
  console.log("\n getting info ... \n");
  connection.query(displayEmpByRole, (err, res) => {
    if (err) throw err;
    // puts names of managers in an array
    let managerChoices = res.map((res) => `${res.First_Name} ${res.Last_Name}`);
    managerChoices.push("None");
    // filters role choices so there are no doubles
    let roleChoices = res
      .map((res) => res.Title)
      .reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
      }, []);

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
          name: "title",
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
        // function to define role id to match the selected title
        let roleID;
        res.forEach((row) => {
          if (row.Title === data.title) return (roleID = row.id);
        });

        // function to match selected manager with their db id
        let managerId;
        res.forEach((row) => {
          if (data.manager === "None") managerId = null;
          else if (`${row.First_Name} ${row.Last_Name}` === data.manager)
            return (managerId = row.id);
        });

        // insert employee into employee column in data base
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

// removes selected employee
function removeEmployee() {
  connection.query(displayAllEmp, (err, res) => {
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
      // matches choice with employee id in db
      .then(function (data) {
        let employeeId;
        res.forEach((row) => {
          if (`${row.First_Name} ${row.Last_Name}` === data.deleteEmployee)
            return (employeeId = row.id);
        });
        // delete query
        connection.query(
          "DELETE FROM employee WHERE ?",
          {
            id: employeeId,
          },
          (err, res) => {
            if (err) throw err;
            console.log("\n   \n");
            console.log(` The Employee has been deleted!\n`);
            console.log(
              "your changes can be seen by selecting a table to view \n"
            );
            // Call readProducts AFTER the DELETE completes
            startChoices();
          }
        );
      });
  });
}

// update role of an employee
function updateRole() {
  console.log("\n getting info ... \n");
  connection.query(displayEmpByRole, (err, res) => {
    //creates array of employee names from db
    let roleChoices = res
      .map((res) => res.Title)
      .reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
      }, []);
    let employeeChoices = res.map(
      (res) => `${res.First_Name} ${res.Last_Name}`
    );

    inquirer
      .prompt([
        {
          type: "list",
          name: "employee",
          message: "Which Employee would you like to update?",
          choices: employeeChoices,
        },
        {
          type: "list",
          name: "title",
          message: "What title would you like to assign this employee?",
          choices: roleChoices,
        },
      ])
      .then(function (data) {
        // matches role to role id in db
        let roleID;
        res.forEach((row) => {
          if (row.Title === data.title) return (roleID = row.id);
        });
        // matches employee to employee id in db
        let employeeId;
        res.forEach((row) => {
          if (`${row.First_Name} ${row.Last_Name}` === data.employee)
            return (employeeId = row.id);
        });
        // update query for role id
        const query = connection.query(
          "UPDATE employee SET ? WHERE ?",
          [
            {
              role_id: roleID,
            },
            {
              id: employeeId,
            },
          ],
          (err, res) => {
            if (err) throw err;
            console.log("\n   \n");
            console.log(` employee has been updated has been updated!\n`);
            console.log(
              "your changes can be seen by selecting a table to view \n"
            );
            startChoices();
          }
        );
      });
  });
}

// update manager prompts and query
function updateManager() {
  console.log("\n getting info ... \n");
  connection.query(displayAllEmp, (err, res) => {
    // makes array of employees
    let employeeChoices = res.map(
      (res) => `${res.First_Name} ${res.Last_Name}`
    );
    // makes an array of managers
    let managerChoices = res.map((res) => `${res.First_Name} ${res.Last_Name}`);
    managerChoices.push("None");
    inquirer
      .prompt([
        {
          type: "list",
          name: "employee",
          message: "Which Employee would you like to update?",
          choices: employeeChoices,
        },
        {
          type: "list",
          name: "manager",
          message: "Who would you like to assign as their manager",
          choices: managerChoices,
        },
      ])
      .then(function (data) {
        // matches selection to employee id in database
        let employeeId;
        res.forEach((row) => {
          if (`${row.First_Name} ${row.Last_Name}` === data.employee)
            return (employeeId = row.id);
        });
        // matches selection to manager id in database
        let managerId;
        res.forEach((row) => {
          if (data.manager === "None") managerId = null;
          else if (`${row.First_Name} ${row.Last_Name}` === data.manager)
            managerId = row.id;
          return managerId;
        });
        // update query for manager id
        const query = connection.query(
          "UPDATE employee SET ? WHERE ?",
          [
            {
              manager_id: managerId,
            },
            {
              id: employeeId,
            },
          ],
          (err, res) => {
            if (err) throw err;
            console.log("\n   \n");
            console.log(` Employee has been updated\n`);
            console.log(
              "your changes can be seen by selecting a table to view \n"
            );
            startChoices();
          }
        );
      });
  });
}

function addRole() {
  console.log("\n getting info ... \n");
  connection.query(`SELECT * FROM department`, (err, res) => {
    if (err) throw err;
    departmentChoices = res.map((results) => results.name);
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the name of the new title?",
          name: "newTitle",
        },
        {
          type: "input",
          message: "what is the salary of the new position?",
          name: "newSalary",
        },
        {
          type: "list",
          name: "department",
          message: "please select the department to add new title to",
          choices: departmentChoices,
        },
      ])
      .then(function (data) {
        connection.query(
          `INSERT INTO role(Title, Salary, department_id) VALUES ("${data.newTitle}", "${data.newSalary}", 
          (SELECT id FROM department WHERE name = "${data.department}"));`
        );
        startChoices();
      });
  });
}

function removeRole() {
  connection.query(displayRole, (err, res) => {
    if (err) throw err;
    let titleChoices = res.map((res) => res.Title);
    inquirer
      .prompt([
        {
          type: "list",
          name: "deleteRole",
          message: "choose the title you would like to delete?",
          choices: titleChoices,
        },
      ])
      .then(function (data) {
        connection.query(
          "DELETE FROM role WHERE ?",
          {
            Title: data.deleteRole,
          },
          (err, res) => {
            if (err) throw err;
            console.log("\n   \n");
            console.log(` The Role has been deleted!\n`);
            console.log(
              "your changes can be seen by selecting a table to view \n"
            );
            // Call readProducts AFTER the DELETE completes
            startChoices();
          }
        );
      });
  });
}

const exitApp = () => {
  console.log("\n Exiting Application \n");
  connection.end();
};
