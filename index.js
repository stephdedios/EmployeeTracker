const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employeesDB",
});

connection.connect(function (err) {
  if (err) throw err;
  intialPrompt();
});

function intialPrompt() {
  inquirer
    .prompt({
      type: "list",
      name: "options",
      message: "Please select from the following options:",
      choices: [
        "View Employees",
        "View Employees by Department",
        "Add Employee",
        "Remove Employee",
        "Update Employee Role",
        "Add New Role",
        "None",
      ],
    })
    .then(function ({ options }) {
      switch (options) {
        case "View Employees":
          viewEmployees();
          break;
        case "View Employees by Department":
          viewEmployeesByDep();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Remove Employee":
          removeEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Add New Role":
          addNewRole();
          break;
        case "None":
          connection.end();
          break;
      }
    });
}

// VIEW EMPLOYEES
function viewEmployees() {
  var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT (m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r
        ON e.role_id = r.id
    LEFT JOIN role department d
        ON d.id = r.department_id
    LEFT JOIN employee m 
        ON m.id = e.manager_id`;

  connection.query(query, function (err, res) {
    if (err) throw err;
    intialPrompt();
  });
}

function viewEmployeesByDep() {
  var query = `SELECT d.id, d.name, r.salary AS budget
      FROM employee e
      LEFT JOIN role r
          ON e.role_id = r.id
      LEFT JOIN department d
          ON d.id = r.department_id
      GROUP BY d.id, d.name`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const depOptions = res.map((data) => ({
      value: data.id,
      name: data.name,
    }));
    promptDepartment(depOptions);
  });
}

function promptDepartment(depOptions) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "department",
        message: "Which department would you like choose frome?",
        choices: depOptions,
      },
    ])
    .then(function (answer) {
      console.log("answer ", answer.departmentId);

      var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department
        FROM employee e
        LEFT JOIN role r
            ON e.role_id = r.id
        LEFT JOIN department d
            ON d.id = r.department_id
        WHERE d.id = ?`;

      connection.query(query, function (err, res) {
        if (err) throw err;

        console.table("response ", res);
        console.log(res.affectedRows + "Employees are viewed!\n");

        intialPrompt();
      });
    });
}

function addEmployee() {
  console.log("New Employee");

  var query = `SELECT r.id, r.title, r.salary
    FROM role r`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleOptions = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`,
    }));

    newEmployee(roleOptions);
  });
}

function newEmployee(roleOptions) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's First Name",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's Last Name",
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the employee's Role at the Company?",
        choices: roleOptions,
      },
    ])
    .then(function (answer) {
      console.log(answer);

      var query = `INSERT INTO employee SET?`;
      connection.query(
        query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleId,
          manager_id: answer.managerId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.insertedRows + "Sucessfully Added!\n");

          intialPrompt();
        }
      );
    });
}

function removeEmployee() {
  console.log("Removing Employee!");

  var query = `SELECT e.id, e.first_name, e.last_name
    FROM employee e`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deletingEmployee = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${id} ${first_name} ${last_name}`,
    }));

    console.table(res);
    console.log("Deleting!\n");

    promptDelete(deletingEmployee);
  });
}

function promptDelete(deletingEmployee) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Please select from the following employees to Remove",
        choices: deletingEmployee,
      },
    ])
    .then(function (answer) {
      var query = `DELETE FROM employee WHERE ?`;

      connection.query(query, { id: answer.employeeId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Removed!\n");

        intialPrompt();
      });
    });
}

function updateEmployeeRole() {
  employeeList();
}

function employeeList() {
  console.log("Updating an Employee");

  var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM employee e
JOIN role r
    ON e.role_id = r.id
JOIN department d
ON d.id = r.deparment_id
JOIN employee m
    ON m.id = e.manager_id`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeOptions = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));

    console.table(res);
    console.log("To Update Employee Role!\n");

    employeeRole(employeeOptions);
  });
}

function employeeRole(employeeOptions) {
  console.log("Updating Employee Role");

  var query = `SELECT r.id, r.title, r.salary
    FROM role r`;

  let roleOptions;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleOptions = res.map(
      ({ id, title, salary } = {
        value: id,
        title: `${title}`,
        salary: `${salary}`,
      })
    );

    console.table(res);
    console.log("Updating Role");
  });
  promptEmployeeRole(employeeOptions, roleOptions);
}

function promptEmployeeRole(employeeOptions, roleOptions) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which Employee would you like to Update their Role?",
        choices: employeeOptions,
      },
      {
        type: "list",
        name: "roleId",
        message: "What would you like to update their Role to?",
        choices: roleOptions,
      },
    ])
    .then(function (answer) {
      var query = `UPDATE employee SET role_id = ? WHERE id = ?`;

      connection.query(query, [answer.roleId, answer.employeeId], function (
        err,
        res
      ) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Updated Roles Successfully!");

        intialPrompt();
      });
    });
}

function addNewRole() {
  var query = `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const departmentOptions = res.map(({ id, name }) => ({
      value: id,
      name: `${id} ${name}`,
    }));

    console.table(res);
    console.log("Department Options");

    promptAddRole(departmentOptions);
  });
}

function promptAddRole(departmentOptions) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "Current Role?",
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Current Salary?",
      },
      {
        type: "list",
        name: "departmentId",
        message: "Current Department?",
        choices: departmentOptions,
      },
    ])
    .then(function (answer) {
      var query = `INSET INTO role SET ?`;

      connection.query(
        query,
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.departmentId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Role Inserted!");

          intialPrompt();
        }
      );
    });
}
