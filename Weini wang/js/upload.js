//game config
const config = {
    type: Phaser.AUTO,
    width: 800, //game width
    height: 600, // game height
    parent: "game-container",
    //set the background color
    backgroundColor: "#0c0c0e",

    //fit the screen
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    //keep pixel style
    render: {
        pixelArt: true
    },

    //use simple arcade physics
    physics: {
        default: "arcade",
    },

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//Create the game instance
const game = new Phaser.Game(config);

//declare variables
let player;
let playerMarker;
let cursors;
let files;
let fakeFiles;
let fakeCount = 0;
let fakeText;
let timerText;
let timeLeft = 30;
let deletedTraces = 0;
let deletedText;
let robots;
let robotSpeedBoost = 0;
let hunterRobot;
let hitCooldown = false;
let playerInvincible = true;
let exitDoor;
let doorOpen = false
let warningText;
let warningBox;
let thoughtBox;
let thoughtText;
let thoughtVisible = false;
let exitText
let gameEnded = false;
let endingBox;
let endingText;
let endingTitle;
let nextPage = "world.html";

let gameStarted = false;
let startOverlay;
let startBox;
let startTitle;
let startInstruction;
let startHint;

//preload the image and spritesheet
function preload() {
    this.load.spritesheet("player", "image/16x32 Walk1.png", {
        frameWidth: 16,
        frameHeight: 32
    });

    this.load.image("frame", "image/background.png");

    this.load.image("trace", "image/trace.png");
    this.load.image("fake", "image/fakefile.png")

    this.load.spritesheet("robots", "image/robots.png", {
        frameWidth: 16,
        frameHeight: 19
    });

    this.load.spritesheet("door", "image/door.png", {
        frameWidth: 50,
        frameHeight: 50
    });
}

function create() {

    //add background image
    const frame = this.add.image(400, 300, "frame");

    //create player,scale the player and clickable
    player = this.physics.add.sprite(400, 300, "player");
    player.setScale(2);
    player.setInteractive();

    //creat a triangle marker above the player
    playerMarker = this.add.triangle(
        player.x,
        player.y - 30,
        0, 0,
        20, 0,
        10, 20,
        0xff0000,
    ).setOrigin(0.5);

    //scale the marker and make sure it renders on top
    playerMarker.setScale(0.5);
    playerMarker.setDepth(1001);

    //make marker fade in and out
    this.tweens.add({
        targets: playerMarker,
        alpha: 0.2,
        duration: 300,
        yoyo: true,
        repeat: -1
    });

    //define world bounds
    this.physics.world.setBounds(0, 0, 800, 600);

    //player cannot leave screen
    player.setCollideWorldBounds(true);

    //make the walking animation
    this.anims.create({
        key: "walkDown",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: "walkSide",
        frames: this.anims.generateFrameNumbers("player", { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: "walkUp",
        frames: this.anims.generateFrameNumbers("player", { start: 8, end: 11 }),
        frameRate: 8,
        repeat: -1
    });

    //set up keyboard input
    cursors = this.input.keyboard.createCursorKeys();

    //create groups for real traces and fake traces
    files = this.physics.add.group();
    fakeFiles = this.physics.add.group();

    //create 15 traces files
    for (let i = 0; i < 15; i++) {
        spawnTrace();
    }

    //set Timer text (top right)
    timerText = this.add.text(565, 20, "Uploading In 0:30", {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "'Space Mono'"
    });

    //show how many traces are deleted
    deletedText = this.add.text(100, 20, "Deleted Remnants: 0 / 15", {
        fontSize: "12px",
        color: "#00f13c",
        fontFamily: "'Space Mono'"
    });

    //show number of decoy uploads
    fakeText = this.add.text(100, 40, "Upload Decoy: 0", {
        fontSize: "12px",
        color: "#00f13c",
        fontFamily: "'Space Mono'"
    });

    //warning message text
    warningText = this.add.text(400, 80, "", {
        fontSize: "20px",
        color: "#ff5555",
        fontFamily: "'Space Mono'",
    }).setOrigin(0.5);

    //warning box background
    warningBox = this.add.rectangle(400, 80, 300, 40, 0x000000);
    warningBox.setStrokeStyle(1, 0xffffff);
    warningBox.setVisible(false);
    warningBox.setDepth(1000);

    //hide warning text initially
    warningText.setVisible(false);
    warningText.setDepth(1001);

    //thought input box
    thoughtBox = this.add.rectangle(400, 300, 420, 120, 0x000000);
    thoughtBox.setStrokeStyle(1, 0xffffff);
    thoughtBox.setVisible(false);
    thoughtBox.setDepth(2000);

    //text inside thought box
    thoughtText = this.add.text(400, 300, "", {
        fontSize: "14px",
        color: "#ffffff",
        fontFamily: "'Space Mono'",
        align: "center",
        wordWrap: { width: 360 }
    }).setOrigin(0.5);

    //hide thought text initially
    thoughtText.setVisible(false);
    thoughtText.setDepth(2001);

    // Create ending title
    endingTitle = this.add.text(400, 260, "", {
        fontSize: "30px",
        fontFamily: "'Space Mono'",
    }).setOrigin(0.5);

    //hide ending text initially
    endingTitle.setDepth(2001);
    endingTitle.setVisible(false);

    //background box for ending screen
    endingBox = this.add.rectangle(400, 300, 500, 180, 0x000000);
    endingBox.setStrokeStyle(1, 0xffffff);
    endingBox.setDepth(2000);
    endingBox.setVisible(false);

    //ending message text
    endingText = this.add.text(400, 325, "", {
        fontSize: "15px",
        color: "#ffffff",
        fontFamily: "'Space Mono'",
        align: "center",
        wordWrap: { width: 420 }
    }).setOrigin(0.5);

    //hide ending text initially
    endingText.setDepth(2001);
    endingText.setVisible(false);

    //click player to toggle thought box
    player.on("pointerdown", () => {
        //do nothing if game ended
        if (gameEnded) return;

        //toggle visibility
        thoughtVisible = !thoughtVisible;

        thoughtBox.setVisible(thoughtVisible);
        thoughtText.setVisible(thoughtVisible);

        //load saved thought
        let savedThought = localStorage.getItem("lastThought");

        //if found thought do ..
        if (savedThought) {
            thoughtText.setText("Archived thought:\n" + savedThought);
            //if non found do ...
        } else {
            thoughtText.setText("No archived thought found.");
        }
    });

    //player overlaps with real files
    this.physics.add.overlap(player, files, collectFile, null, this);

    //create robot group
    robots = this.physics.add.group();

    //robot walking animation
    this.anims.create({
        key: "robotWalk",
        frames: this.anims.generateFrameNumbers("robots", {
            start: 0,
            end: 7
        }),
        frameRate: 6,
        repeat: -1
    });

    //spawn 10 robots
    for (let i = 0; i < 10; i++) {
        let robot = robots.create(
            Phaser.Math.Between(140, 660),
            Phaser.Math.Between(140, 460),
            "robots"
        );
        robot.setScale(2);

        //play walking animation,bounce and stay inside world
        robot.anims.play("robotWalk", true);
        robot.body.setCollideWorldBounds(true);
        robot.body.setBounce(0.2);

        //first robot becomes hunter
        if (i === 0) {
            hunterRobot = robot;
            robot.setTint(0xff8888);
            robot.targetFake = null;
        }

        //start movement
        moveRobot.call(this, robot);

    }

    //create door opening animation
    this.anims.create({
        key: "doorOpen",
        frames: this.anims.generateFrameNumbers("door", {
            start: 0,
            end: 12
        }),
        frameRate: 12,
        repeat: -1
    });

    //create exit door
    exitDoor = this.physics.add.sprite(400, 500, "door");
    exitDoor.setVisible(false);
    exitDoor.body.enable = false;

    //player is temporarily invincible for 2 seconds
    this.time.delayedCall(2000, () => {
        playerInvincible = false;
    });

    //countdown event runs every second
    this.time.addEvent({
        //run every 1 second
        delay: 1000,
        // repeat 30 times total
        repeat: 29,
        callback: () => {
            //stop if not active
            if (!gameStarted || doorOpen || gameEnded) return;

            // reduce time by 1
            timeLeft--;
            //update timer text
            timerText.setText("Uploading In 0:" + timeLeft);

            //when timer reaches 0
            if (timeLeft <= 0) {
                doorOpen = true;

                //remove robots and files
                robots.clear(true, true);
                files.clear(true, true);
                fakeFiles.clear(true, true);

                //show the exit Door
                exitDoor.setVisible(true);
                exitDoor.body.enable = true;
                exitDoor.anims.play("doorOpen", true);

                //exit message
                exitText = this.add.text(400, 530, "UPLOAD GATE OPEN", {
                    fontSize: "12px",
                    color: "#00f13c",
                    fontFamily: "'Space Mono'"
                }).setOrigin(0.5);

                //make exit text blink
                this.tweens.add({
                    targets: exitText,
                    alpha: 0,
                    duration: 1000,
                    yoyo: true,
                    repeat: 1000
                });

                //keep text on top
                exitText.setDepth(1001);
            }
        }
    });

    //player touches robot
    this.physics.add.overlap(player, robots, hitRobot, null, this);

    //hunter robot touches fake file
    this.physics.add.overlap(hunterRobot, fakeFiles, robotEatFake, null, this);

    //player reaches exit door
    this.physics.add.overlap(player, exitDoor, reachDoor, null, this);

    //click to next page after game ends
    this.input.on("pointerdown", () => {
        if (gameEnded) {
            window.location.href = nextPage;
        }
    });

    //dark overlay background
    startOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    startOverlay.setDepth(3000);

    //instruction box in the center
    startBox = this.add.rectangle(400, 300, 460, 260, 0x000000);
    startBox.setStrokeStyle(2, 0x727272);
    startBox.setDepth(3001);

    //make box clickable
    startBox.setInteractive({ useHandCursor: true });

    //title text
    startTitle = this.add.text(400, 210, "UPLOAD PROTOCOL", {
        fontSize: "26px",
        color: "#f10000",
        fontFamily: "'Space Mono'"
    }).setOrigin(0.5);

    //set it at the top
    startTitle.setDepth(3002);

    //instructions shown before game starts
    startInstruction = this.add.text(400, 320,
        "Use arrow keys to move\n\n" +
        "Delete all 15 remnant\n" +
        "Each deletion leaves a false decoy\n" +
        "Click the character to inspect your thought\n" +
        "Avoid detection\n" +
        "Upload your thought safely!\n",
        {
            fontSize: "12px",
            color: "#ffffff",
            fontFamily: "'Space Mono'",
            align: "center",
            lineSpacing: 8
        }
    ).setOrigin(0.5);

    startInstruction.setDepth(3002);

    //hint to start game
    startHint = this.add.text(400, 400, "Click this box to begin", {
        fontSize: "12px",
        color: "#aaaaaa",
        fontFamily: "'Space Mono'"
    }).setOrigin(0.5);

    startHint.setDepth(3002);

    //click instruction box to start
    startBox.on("pointerdown", () => {
        gameStarted = true;

        //hide start screen
        startOverlay.setVisible(false);
        startBox.setVisible(false);
        startTitle.setVisible(false);
        startInstruction.setVisible(false);
        startHint.setVisible(false);
    });
}

function update() {

    //if game has not started, stop player movement
    if (!gameStarted) {
        player.setVelocity(0);
        return;
    }

    //if game ended, stop player movement
    if (gameEnded) {
        player.setVelocity(0);
        return;
    }

    //reset velocity every frame
    player.body.setVelocity(0);

    //make marker follow the player
    playerMarker.x = player.x;
    playerMarker.y = player.y - 30;

    //if in cooldown, do nothing
    if (hitCooldown) {
        return;
    }

    //movement and animation of player
    if (cursors.left.isDown) {
        player.setVelocityX(-120);

        player.anims.play("walkSide", true);

        player.setFlipX(true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(120);

        player.anims.play("walkSide", true);

        player.setFlipX(false);
    }
    else if (cursors.down.isDown) {
        player.setVelocityY(120);

        player.anims.play("walkDown", true);

        player.setFlipX(false);
    }
    else if (cursors.up.isDown) {
        player.setVelocityY(-120);

        player.anims.play("walkUp", true);

        player.setFlipX(false);
    }

    //stop movement and animation
    else {
        player.setVelocity(0);

        player.anims.stop();
    }

    //loop through all robots
    robots.getChildren().forEach(function (robot) {

        //only for the hunter robot
        if (robot === hunterRobot) {
            //get all active fake files
            let targets = fakeFiles.getChildren().filter(f => f.active);

            if (targets.length > 0) {

                //if no target or target is gone,pick a new random one
                if (!robot.targetFake || !robot.targetFake.active) {
                    robot.targetFake = Phaser.Math.RND.pick(targets);
                }

                //calculate angle to target
                let angle = Phaser.Math.Angle.Between(
                    robot.x,
                    robot.y,
                    robot.targetFake.x,
                    robot.targetFake.y
                );
                //speed with difficulty boost
                let speed = 90 + robotSpeedBoost;

                //move toward the target
                robot.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            } else {
                // no targets reset
                robot.targetFake = null;
            }
        }

        //if robot is not moving ,stop animation
        if (robot.body.velocity.length() < 5) {
            robot.anims.stop();
        } else {
            //if moving, play animation
            robot.anims.play("robotWalk", true);
        }
    });

}

//cearte player collect file
function collectFile(player, file) {

    //disable the file's physisc 
    file.disableBody(true, false);

    //add animation to the file
    this.tweens.add({
        targets: file,
        alpha: 0,
        scale: 0,
        duration: 200,
        onComplete: () => file.destroy()
    });

    //increase deleted trace count
    deletedTraces++;

    //when 5 traces are deleted, increase robot speed
    if (deletedTraces === 5) {
        robotSpeedBoost = 80;

        //create an alert text
        let alertText = this.add.text(400, 550, "SURVEILLANCE INCREASED", {
            fontSize: "18px",
            color: "#fc0000",
            fontFamily: "'Space Mono'"
        }).setOrigin(0.5);

        alertText.setDepth(1001);

        //make the alert text blink
        this.tweens.add({
            targets: alertText,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 6
        });

        //remove the alert text after 1.2s
        this.time.delayedCall(1200, () => {
            alertText.destroy();
        });
    }

    //spawn a fake trace at a random position
    spawnFakeTrace(Phaser.Math.Between(80, 720), Phaser.Math.Between(80, 520));

    //update score text on screen
    updateScoreText();

}

//add real trace (yellow file) in the game
function spawnTrace() {

    //create a file at a random position
    let file = files.create(
        Phaser.Math.Between(140, 660),
        Phaser.Math.Between(140, 460),
        "trace"
    );

    //scale the file
    file.setScale(0.3);

}

//create a fake trace at a given position
function spawnFakeTrace(x, y) {
    let fake = fakeFiles.create(x, y, "fake");
    fake.setScale(0.3);

}

//create the player hit the robot
function hitRobot(player, robot) {
    // stop if player is in cooldown or temporarily invincible
    if (hitCooldown || playerInvincible) return;

    //turn on hit cooldown
    hitCooldown = true;

    //stop player movement
    player.setVelocity(0, 0);
    player.body.allowGravity = false;

    //if collected traces > 0, lose one
    if (deletedTraces > 0) {

        deletedTraces--;
        updateScoreText();

        //show losing score text
        let lostText = this.add.text(player.x, player.y - 20, "COLLECTED -1", {
            fontSize: "14px",
            color: "#ff0000",
            fontFamily: "'Space Mono'"
        }).setOrigin(0.5);
        lostText.setDepth(1001);

        //make the animation for the text
        this.tweens.add({
            targets: lostText,
            y: lostText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => lostText.destroy()
        });
    }

    // add a new real trace 
    spawnTrace();

    //tint player red 
    player.setTint(0xff0000);

    //show warning message
    warningText.setText("ARCHIVE BREACHED");
    warningText.setVisible(true);
    warningBox.setVisible(true);

    //shake the warning UI
    this.tweens.add({
        targets: [warningText, warningBox],
        x: '+=5',
        duration: 50,
        yoyo: true,
        repeat: 5
    });

    //reset state after 3s
    this.time.delayedCall(3000, () => {
        warningText.setVisible(false);
        warningBox.setVisible(false);
        hitCooldown = false;
        player.clearTint();
        player.body.allowGravity = true;

    });

}

//create score text
function updateScoreText() {
    deletedText.setText("Deleted Remnants: " + deletedTraces + "/ 15");
}

//create robot movement
function moveRobot(robot) {

    //check if robot exists and is active
    if (!robot || !robot.body || !robot.active) {
        return;
    }

    //Define movement boundaries
    let minX = 140;
    let maxX = 660;
    let minY = 140;
    let maxY = 460;

    //random chance to stop moving
    let isStop = Phaser.Math.Between(0, 10) > 8;

    if (isStop) {
        robot.body.setVelocity(0, 0);
        robot.anims.stop();
    } else {

        //pick a random angle
        let angle = Phaser.Math.Between(0, 360);

        //adjust direction if robot is near edges
        if (robot.x <= minX) {
            angle = Phaser.Math.Between(-60, 60);
        }
        else if (robot.x >= maxX) {
            angle = Phaser.Math.Between(120, 240);
        }
        else if (robot.y <= minY) {
            angle = Phaser.Math.Between(30, 150);
        }
        else if (robot.y >= maxY) {
            angle = Phaser.Math.Between(210, 330);
        }
        else {
            angle = Phaser.Math.Between(0, 360);
        }

        //random speed + after 5 collected
        let speed = Phaser.Math.Between(100, 200) + robotSpeedBoost;

        //convert angle to velocity vector
        this.physics.velocityFromAngle(angle, speed, robot.body.velocity);

        //play walking animation
        robot.anims.play("robotWalk", true);
    }

    //call moveRobot again after a random delay
    this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
        if (!doorOpen && robot && robot.body && robot.active) {
            moveRobot.call(this, robot);
        }
    });
}

//create robot reaches a fake trace
function robotEatFake(robot, fake) {

    //skip if fake is already inactive
    if (!fake.active) return;

    //disable physics before animation
    fake.disableBody(true, false);

    //fade out and shrink effect
    this.tweens.add({
        targets: fake,
        alpha: 0,
        scale: 0,
        duration: 150,
        onComplete: () => fake.destroy()
    });

    //increase fake count
    fakeCount++;

    //update display text
    fakeText.setText("Upload Decoy: " + fakeCount);

    //tint robot to show action
    robot.setTint(0xff4444);

    //reset current target
    robot.targetFake = null;
}

//create player reaches the exit door
function reachDoor(player, door) {

    //stop if door not open or game already ended
    if (!doorOpen || gameEnded) return;

    //mark game as ended
    gameEnded = true;

    //stop player movement and animation
    player.setVelocity(0, 0);
    player.anims.stop();
    player.body.enable = false;

    //hide player marker
    if (playerMarker) {
        playerMarker.setVisible(false);
    }

    //show ending UI
    endingBox.setVisible(true);
    endingTitle.setVisible(true);
    endingText.setVisible(true);

    //if all traces deleted
    if (deletedTraces >= 15) {

        //green border and text
        endingTitle.setText("UPLOAD COMPLETE");
        endingTitle.setColor("#00f13c");

        endingBox.setStrokeStyle(2, 0x00f13c);

        endingText.setText(
            "Your thought slipped through unseen.\n" +
            "The system fell into your trap\n" +
            "and archived your false traces instead."
        );

    } else {

        //red border and text
        endingTitle.setText("UPLOAD COMPLETE");
        endingTitle.setColor("#ff4444");

        endingBox.setStrokeStyle(2, 0xff4444);

        endingText.setText(
            "Your thought was uploaded.\n" +
            "Your traces followed behind it.\n" +
            "The system kept everything."
        );
    }
}
