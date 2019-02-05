var mysql = require('mysql');
const cTable = require('console.table');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon'
});


var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'password',
    database        : 'bamazon'
  });


var inquirer = require('inquirer');

var cart = {};

function calculateTotal() {
    var grandTotal = 0;
    var keys = Object.keys(cart);
    keys.forEach(product => {
        var subtotal = cart[product].Total;
        grandTotal += Number(subtotal);

    });

    console.log(`___________________`);
    console.log(`TOTAL: $${grandTotal}`);
    console.log(`___________________`);
    console.log("");
}

//connection.connect();

//initial display of products
function showProducts(callback) {
    callback();
    
    connection.query('SELECT * FROM products', function (error, results, fields) {
        if (error) throw error;
        console.log(`WELCOME TO BAMAZON!`);
        console.log(`-------------------`);
        var listings = [];
        results.forEach(element => {
            var id = element.item_id;
            var name = element.product_name;
            var price = element.price;
            listings.push({ "ID": id, "Name": name, "Price": price });
        });
        console.table(listings);
        //ask user to enter in an item id
        console.log("Press any key to continue");
        connection.release();
    });
    
}
//ask user which product they would like to purcchase
function axWutProduct() {
    //connection.connect();
    inquirer
        .prompt([
            /* Pass your questions in here */
            {
                type: "input",
                name: "Choose",
                message: "Please Provide the Product ID of the Item You would like to buy",
            },
        ])
        .then(answers => {
            // Use user feedback for... whatever!!
            getProduct(answers.Choose);
        });
}

function getProduct(id) {
   
    connection.query('SELECT * FROM products WHERE item_id = ?', [id], function (error, results) {
        if (error) throw error;
        var productID = results[0].item_id;

        var product = results[0].product_name;
        var price = results[0].price;
        inquirer
            .prompt([
                /* Pass your questions in here */
                {
                    type: "input",
                    name: "Quantity",
                    message: `How many ${product} would you like?`
                }
            ])
            .then(answers => {
                // Use user feedback for... whatever!!
                var quantity = Number(answers.Quantity);
                console.log(`You added (${quantity}) ${product} to you shopping cart!`);

                if (cart.hasOwnProperty(`${productID}`)) {
                    var oldQuantity = cart[productID].Quantity;
                    var newQuantity = oldQuantity + quantity;
                    cart[productID].Quantity = newQuantity;
                    //printCart();
                } else {
                    var total = quantity * price;
                    cart[productID] = { "Name": product, "Quantity": quantity, "Price": price, "Total": total };
                    //printCart();
                }
                readyToCheckOut();

            });
    });
}
function printCart() {
    var printCart = [];
    var products = Object.keys(cart);
    var total = Number(products.indexOf("total"));
    products.splice(total, total + 1);
    products.forEach(function (product) {
        printCart.push({ "Product": cart[product].Name, "Quantity": cart[product].Quantity, "Price": cart[product].Price, "Sub-Total": cart[product].Total });

    });
    console.table(printCart);
    calculateTotal();

}

function readyToCheckOut() {
    inquirer
        .prompt([
            /* Pass your questions in here */
            {
                type: "list",
                name: "Checkout",
                message: "What would you like to do next?",
                choices: ["Check Out", "Keep Shopping", "View Cart", "Quit"],
            }
        ])
        .then(answers => {
            // Use user feedback for... whatever!!
            if (answers.Checkout === "Check Out") {
                checkOut();
            } else if (answers.Checkout === "View Cart") {
                printCart();
                readyToCheckOut();
            } else if (answers.Checkout === "Quit") {
                console.log(`Thank you! Come Again!!!`);
                connection.end();
            } else {
                showProducts(axWutProduct);
            }
        });
}

function checkOut() {
    // console.log(cart);
    var cartItems = Object.keys(cart);
    // console.log(cartItems);
    cartItems.forEach(function (item) {
        console.log(cart[item].Quantity);
        var cartQuantity = cart[item].Quantity;
        connection.query('SELECT * FROM products', function (error, results) {
            if (error) throw error;    
            var id = item;
            console.log("\n");
            console.log(id);
            var quantity = results[id].stock_quantity;
            
            var newquantity = Number(quantity) - Number(cartQuantity);
            if(newquantity < 0){
                console.log(`Insufficient quantity of ${cart[item].Name}`);
                console.log(`____________________________________________`);
                console.log(`We apologize for the inconvience and have removed the out of stock items from your cart.`);
                console.log(`Please take a moment to review the updates made to your cart`);
                printCart();
            }else{
                updateInventory(newquantity, item);
                emptyCart();
                quitOrRestart();
            }
            
        });
    });


    function emptyCart(){
        var keys = Object.keys(cart);
        for(var i = 0; i < keys.length; i++){
            var currentKey = keys[i];
            delete cart[currentKey];
        }
    }

    function quitOrRestart() {

        console.clear();
        inquirer
            .prompt([
                /* Pass your questions in here */
                {
                    type: "list",
                    name: "Quit",
                    message: "Check Out Successful! \nThank You for shopping with Bamazon!\nWhat would you like to do next?",
                    choices: ["Keep Shopping", "Quit"],
                }
            ])
            .then(answers => {
                // Use user feedback for... whatever!!
                if (answers.Quit === "Quit") {
                    console.log(`Thank you! Come Again!!!`);
                    
                } else {
                    showProducts(axWutProduct);
                    
                }
            });

    }
    

}

function updateInventory(quantity, id) {
    connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [quantity, id], function (err, res) {
        if (err) throw err;
        //console.log(res);
        //printProductsDB();
    });
}

function updateProductSales(sales, id){
    connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [sales, id], function (err, res) {
        if (err) throw err;
        console.log(res);
        printProductsDB();
    });
}

function printProductsDB() {
    connection.query('SELECT * FROM products', function (error, results) {
        if (error) throw error;
        console.table(results);
    });
}


    
showProducts(axWutProduct);




