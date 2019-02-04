const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon'
});
connection.connect();

// var query = `SELECT * FROM products`;
// connection.query(query, function (error, results, fields) {
//     if (error) throw error;
//     console.log(results);
// });

// inquirer
//   .prompt([
//     /* Pass your questions in here */
//   ])
//   .then(answers => {
//     // Use user feedback for... whatever!!
//   });

function mainMenu() {
    inquirer
      .prompt([
        /* Pass your questions in here */
        {
            type: "list",
            name: "mainMenu",
            message: "\n|__________MAIN_MENU__________|\n",
            choices: ["View Product Sales by Department", "Create New Department", "Quit"]
        }
      ])
      .then(answers => {
        // Use user feedback for... whatever!!
        console.log(answers.mainMenu);

        if (answers.mainMenu === "View Product Sales by Department") {

        } else if (answers.mainMenu === "Create New Department") {

        } else if (answers.mainMenu === "Quit") {

        }

      });
}
mainMenu();
