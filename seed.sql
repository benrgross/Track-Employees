DROP DATABASE IF EXISTS employeeDB;

CREATE DATABASE employeeDB;

USE employeeDB;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL
  salary DECIMAL NOT NULL
  department_id NOT NULL 
  CONSTRAINT fk_deptartment_id FOREIGN KEY (department_id) REFERENCES department(id)
  PRIMARY KEY (id)

);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL
  role_id INTEGER NOT NULL 
  CONSTRAINT fk_role_id FOREIGN KEY role_id REFERENCES role(id)
  manager_id INT NULL 
  CONSTRAINT fk_manager_id FOREIGN KEY manager_id REFERENCES employee(id)
  PRIMARY KEY (id)
);


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
('Sales Person', 750000, 1)
('Lead Engineer', 175000, 2),
('Software Engineer', 1200000, 2)
('Junior Engineer', 75000, 2)
('Account Manager', 150000, 3)
('Accountant', 110000, 3)
('Legal Team Lead', 200000, 4)
('Lawyer', 180000, 4)
('Paralegal', 75000, 4)


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('David', 'Nunez', 1)
('Jackie', 'Pentigras', 2, 1)
('Jaquine', 'Delancy', 3)
('David', 'Morales', 4, 3)
('Jeff', 'Nickle', 5, 3)
('Allison', 'Parlor', 6)
('James', 'Redford', 7, 5)
('Magnus', 'Offer', 8)
('Jessica', 'McSorly', 9, 8)
('Decklin', "Holiday", 10, 8)



-- view all employees 

SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department on role.department_id = department.id
