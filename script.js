// START TUTORIAL AT 5:15!!!


// Wait for the page to be fully loaded
window.addEventListener("load", function() {
    /** @type {HTMLCanvasElement} **/ // This tells VS Code to suggest canvas methods
    
    const canvas = document.getElementById("canvas1");
    const context = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 720;
    let enemies = []; // Array to store enemies

    // Class to handle player input
    class InputHandler {
        constructor() {
            this.keys = []; // Array to keep information about which arrow key is currently pressed
            
            // Listen for the player to press arrow keys
            window.addEventListener("keydown", event => { // Arrow function is needed here to tell JS that "this" below refers to InputHandler
                // Arrow functions don't bind their own "this" but inherit it from their parent scope, in this case from InputHandler
                // Check if any of the arrow keys is pressed by accessing the "key" property of the "event" object and check if it already exists in the array
                if ((event.key == "ArrowDown" ||
                    event.key == "ArrowUp" ||
                    event.key == "ArrowLeft" ||
                    event.key == "ArrowRight")
                    && this.keys.indexOf(event.key) == -1) { // indexOf returns -1 if no value exists in the array (no particular arrow key pressed yet)
                    this.keys.push(event.key); // Add the pressed arrow key to the above keys[] array
                }
            });

            // Listen for the player to release arrow keys
            window.addEventListener("keyup", event => {
                // Check if any of the arrow keys is released
                if (event.key == "ArrowDown" ||
                    event.key == "ArrowUp" ||
                    event.key == "ArrowLeft" ||
                    event.key == "ArrowRight") { 
                    this.keys.splice(this.keys.indexOf(event.key), 1); // Remove it from the array using splice() method
                    // which expects the index at which to remove the element and the number of elements to be removed (in this case 1)
                    // this.keys.indexOf(event.key) allows to find the index of the currenly released key
                }
            });
        }
    }

    // Class to handle player character
    class Player {
        constructor(gameWidth, gameHeight) { // Pass game size to the constructor
            // Handle size and placement
            this.gameWidth = gameWidth; // Convert the size into class properties
            this.gameHeight = gameHeight;
            this.width = 200; // It's good to have assets of the exact size used in code!
            this.height = 200;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            // Get the actual player image from HTML
            this.image = document.getElementById("player");
            // Properties to control which frame of the sprite sheet is displayed
            this.frameX = 0;
            this.frameY = 0;
            this.speed = 0;
            // Properties to handle jumping
            this.vy = 0; // Force to move player up
            this.gravity = 1; // Force to keep player getting back to the ground :)
        }
        // Custom method with context as argument so that it knows where to draw the sprite
        draw(context) {

            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        // Custom method with input (defined below) as argument to account for player input (controls)
        update(input) {
           
            // Check if the player pressed the arrow right key
            if (input.keys.indexOf("ArrowRight") > -1) { // If the keys[] array contains "ArrowRight" (its index exists) aka arrow right key pressed
                this.speed = 5; // Move to the right with this speed value
            }
            // Check if the player pressed the arrow left key
            else if (input.keys.indexOf("ArrowLeft") > -1) {
                this.speed = -5; // Move to the left with this speed value
            }
            else {
                this.speed = 0; // If no arrow key pressed, don't move
            }
            // The following check has to be independent from those above to allow jumping while moving horizontally
            // Check if the player pressed the arrow up key and is on the ground
            if (input.keys.indexOf("ArrowUp") > -1 && this.onGround() == true) {
                this.vy -= 32; // Add vertical velocity
            }

            // Horizontal movement handler
            this.x += this.speed;
            // Make sure the player doesn't go beyond canvas
            if (this.x < 0) { // If too far to the left
                this.x = 0; // Set it back to the left border
            }
            else if (this.x > this.gameWidth - this.width) { // If too far to the right (canvas - player width)
                this.x = this.gameWidth - this.width; // Set it back to the right border
            }

            // Vertival movement handler
            this.y += this.vy;
            // Make sure the player comes back to the ground once in the air
            if (this.onGround() == false) { // If player is in the air
                this.vy += this.gravity; // Gradually add gravity to put it back on the ground
            }
            else { // If player is back on the ground
                this.vy = 0; // Stop pulling it down
            }
            // Make sure the player doesn't fall through the ground after the jump
            if (this.y > this.gameHeight - this.height) { // If player's vertical position was below the ground
                this.y = this.gameHeight - this.height; // Set it back to the ground
            }
        }
        // Custom function to check if the player is in the air
        onGround() {
            // Check if player's vertical position isn't beyond its own height 
            if (this.y >= this.gameHeight - this.height) {
                return true; // On the ground
            }
            else {
                return false; // In the air
            }
        }
    }

    // Class to handle the background
    class Background {
        constructor(gameWidth, gameHeight) { // Pass game size to the constructor
            // Handle size and placement
            this.gameWidth = gameWidth; // Convert the size into class properties
            this.gameHeight = gameHeight;
            this.width = 2400;
            this.height = 720;
            this.x = 0;
            this.y = 0;
            // Get the actual background image from HTML
            this.image = document.getElementById("background");
            // Property to move the background
            this.speed = 4;
        }
        // Custom method with context as argument so that it knows where to draw the background
        draw(context) {
            // Draw the first background
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            // Draw the same background twice, one next to the other, accounting for the scrolling speed
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        // Custom method to make the background move
        update() {
            this.x -= this.speed; // Scroll to the left with the given speed
            if (this.x < 0 - this.width) { // When the first image has gone entirely to the left (the second one takes its place so there is no gap)
                this.x = 0; // Set it back to the initial position
            }
        }
    }

    // Class to handle enemies
    class Enemy {
        constructor(gameWidth, gameHeight) { // Pass game size to the constructor
            // Handle size and placement
            this.gameWidth = gameWidth; // Convert the size into class properties
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.x = this.gameWidth; // Place the enemy just beyond the right border of the canvas
            this.y = this.gameHeight - this.height;
            // Get the actual enemy image from HTML
            this.image = document.getElementById("enemy");
            // Properties to control which frame of the sprite sheet is displayed
            this.frameX = 0;
            this.frameY = 0;
            // Set enemy speed
            this.speed = 8; // Could be randomized
        }
        // Custom method with context as argument so that it knows where to draw the enemy
        draw(context) {
            // frameX and frameY would be useful if the sprite sheet had more than one animation frame
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        // Custom method to make the enemy move from right to left
        update() {
            this.x -= this.speed;
        }
    }
    
    // Function to animate and remove enemies
    function handleEnemies(deltaTime) {
        if (enemyTimer > (enemyInterval + randomEnemyInterval)) { // Every 1000 ms (enemyInterval) + a random number
            enemies.push(new Enemy(canvas.width, canvas.height)); // Add new Enemy object to the enemies[] array
            enemyTimer = 0; // Reset the timer for the next interval
        }
        else { // Otherwise, keep increasing the timer by the value of deltaTime
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => { // For each element of the array ("enemy" is a placeholder for each element)
            enemy.draw(context); // Display the enemy
            enemy.update(); // Make it move
        });
    }

    // Function to display score, etc.
    function displayStatus() {

    }

    // An instance of the InputHandler class to actually register user input
    const input = new InputHandler();
    // An instance of the Player class to actually create the player character
    const player = new Player(canvas.width, canvas.height); // The constructor of the class expects game size which is canvas size
    // An instance of the Background class to actually display the background
    const background = new Background(canvas.width, canvas.height); // The constructor of the class expects game size which is canvas size
    
    // A variable to keep track of game time
    let lastTime = 0;
    // A variable to time enemy spawning
    let enemyTimer = 0;
    // A variable to control how frequently to spawn a new enemy
    let enemyInterval = 1000;
    // A variable to randomize enemy spawning
    let randomEnemyInterval = Math.random() * 1000 + 500;

    // Main animation loop
    function animate(timeStamp) { // Pass timeStamp as an argument
        // Create deltTime that adjusts game speed to the machine it's running on
        // deltaTime keeps track of how many miliseconds the machine needs for one frame
        // timeStamp of the current loop in auto-generated by requestAnimationFrame
        // lasTime is the timeStamp from the previous loop
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp; // Save the current timeStamp for the next loop
        context.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(context); // Display the background
        background.update(); // Make it move
        player.draw(context); // Display the player character
        player.update(input); // Make it move
        handleEnemies(deltaTime); // Display and move enemies using deltaTime
        requestAnimationFrame(animate); // Call the function recursively
    }
    animate(0); // For the first iteration there is no timeStamp, but it needs some argument, e.g. 0
});