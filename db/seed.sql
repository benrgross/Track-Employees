
-- seeds for inital db info 
INSERT INTO department (name)
VALUES 
('Sales'),
('Engineering'),
('Finance'),
('Legal'),
('HR');

INSERT INTO role(title, salary, department_id)
VALUES 
('Sales Lead', 120000, 1),
('Sales Person', 750000, 1),
('Lead Engineer', 175000, 2),
('Software Engineer', 1200000, 2),
('Junior Engineer', 75000, 2),
('Account Manager', 150000, 3),
('Accountant', 110000, 3),
('Legal Team Lead', 200000, 4),
('Lawyer', 180000, 4),
('Paralegal', 75000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('David', 'Nunez', 1, null),
('Jackie', 'Pentigras', 2, 1),
('Jaquine', 'Delancy', 3, null),
('David', 'Morales', 4, 3),
('Jeff', 'Nickle', 5, 3),
('Allison', 'Parlor', 6, null),
('James', 'Redford', 7, 5),
('Magnus', 'Offer', 8, null),
('Jessica', 'McSorly', 9, 8),
('Decklin', "Holiday", 10, 8);


-- selections for tables 
Select * From department;

Select * From role;

Select * From employee;

--- view all with employee
SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, 
CONCAT(e.first_name, ' ' ,e.last_name) AS Manager 
FROM employee 
INNER JOIN role ON role.id = employee.role_id 
INNER JOIN department ON department.id = role.department_id 
left join employee e ON employee.manager_id = e.id;


-- View By Manager 
SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS Manager, department.name AS Department, employee.id, employee.First_Name, employee.Last_Name, role.Title
FROM employee
LEFT JOIN employee manager on manager.id = employee.manager_id
INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
INNER JOIN department ON (department.id = role.department_id)
ORDER BY manager;

-- view by dept
SELECT department.name AS Department, role.Title, employee.First_Name, employee.Last_Name
FROM employee
LEFT JOIN role ON role.id = employee.role_id
LEFT JOIN department ON (department.id = role.department_id)
ORDER BY department.name;

-- view by Role
SELECT role.Title, role,id department.name AS Department, employee.First_Name, employee.Last_Name
FROM employee
LEFT JOIN role On role.id = employee.role_id
LEFT JOIN department on department.id = role.department_id;


--  display employee  name by role 
 SELECT role.Title, role.id, employee.First_Name, employee.Last_Name 
 FROM role left join employee on role.id = employee.role_id;

-- View the total utilized budgets of departments
SELECT department.id, department.name,  SUM(salary) 
FROM  role
INNER JOIN department ON (department.id = role.department_id)
GROUP BY  department_id;