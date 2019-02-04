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

function showProducts() {
    var query = `SELECT * FROM products`;
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        var listings = [];

        results.forEach(element => {
            var id = element.item_id;
            var name = element.product_name;
            var price = element.price;
            var quantity = element.stock_quantity;
            listings.push({ "ID": id, "Name": name, "Price": price, "Quantity": quantity });
        });

        console.table(listings);
        managerMenu();
    });
}

function checkLowInventory() {
    var query = `SELECT * FROM products WHERE stock_quantity < 5;`;
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        var listings = [];

        results.forEach(element => {
            var id = element.item_id;
            var name = element.product_name;
            var price = element.price;
            var quantity = element.stock_quantity;
            listings.push({ "ID": id, "Name": name, "Price": price, "Quantity": quantity });
        });
        //console.log(results);
        console.table(listings);
        managerMenu();
    });
}

function orderMoreInventory() {
    var query = `SELECT * FROM products;`;
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        var listings = [];

        results.forEach(element => {
            var id = element.item_id;
            var name = element.product_name;
            var quantity = element.stock_quantity;
            listings.push({ "name": `ID: ${id}    Name: ${name}   QTY:${quantity}`, "data": id })
            //listings.push(`ID: ${id}    Name: ${name}   QTY:${quantity}`);
        });

        inquirer
            .prompt([
                /* Pass your questions in here */

                {
                    type: 'list',
                    name: 'select',
                    message: 'select the item(s) you would like to order',
                    choices: listings
                }
            ])
            .then(answers => {
                // Use user feedback for... whatever!!


                console.log(answers.select);
                var selection = answers.select;
                var patt1 = /\s\d+/g;
                var id = selection.match(patt1);
                
                inquirer
                    .prompt([
                        /* Pass your questions in here */
                        {
                            name: "qty",
                            type: "input",
                            message: `How many units would you like to order?`
                        }
                    ])
                    .then(answers => {
                        //console.log(answers.qty);
                        var qty = answers.qty;
                        // Use user feedback for... whatever!!
                        function updateInventory(id, qty) {
                            var query = `UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?;`;
                            connection.query(query, [qty, id], function (error, results, fields) {
                                if (error) throw error;
                                console.log(`Added ${qty} units.`);
                                managerMenu();
                            });
                        }
                        updateInventory(id, qty);

                    });





            });

    });

}

function managerMenu() {
    inquirer
        .prompt([
            /* Pass your questions in here */
            {
                type: 'list',
                name: 'menu',
                message: '|__________MAIN MENU__________|\n',
                choices: [
                    'View Products for Sale',
                    'View Low Inventory',
                    'Add to Inventory',
                    'Add New Product',
                    'Quit'
                ]
            }
        ])
        .then(answers => {
            // Use user feedback for... whatever!!

            if (answers.menu === 'View Products for Sale') {
                showProducts();
            } else if (answers.menu === 'View Low Inventory') {
                checkLowInventory();
            } else if (answers.menu === 'Add to Inventory') {
                orderMoreInventory();
            } else if (answers.menu === 'Add New Product') {
                function addNewProduct() {
                    inquirer
                      .prompt([
                        /* Pass your questions in here */
                        {
                            type: "input",
                            name: "name",
                            message: "What is the name of the new product?"
                        },
                        {
                            type: "input",
                            name: "department",
                            message: "What department will the product be sold in?"
                        },
                        {
                            type: "input",
                            name: "price",
                            message: "What is the price of the new product?"
                        },
                        {
                            type: "input",
                            name: "qty",
                            message: "How many units do you have?"
                        }
                      ])
                      .then(answers => {
                        // Use user feedback for... whatever!!
                        console.log(answers);
                        var name = answers.name;
                        var department = answers.department;
                        var price = answers.price;
                        var qty = answers.qty;
                        var query = `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES(?,?,?,?) ;`;
                            connection.query(query, [name, department, price, qty],function (error, results, fields) {
                                if (error) throw error;
                                console.log(`${name} added successfully!!!`)
                                //console.log(results);
                                managerMenu();
                            });

                      });
                }
                addNewProduct();
                
            } else {
                connection.end();
            }

        });

}

managerMenu();

// inquirer
//   .prompt([
//     /* Pass your questions in here */
//   ])
//   .then(answers => {
//     // Use user feedback for... whatever!!
//   });

