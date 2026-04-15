const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    backgroundColor: "#0c0c0e",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    render: {
        pixelArt: true
    },

    physics: {
        default: "arcade",
    },

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let files;
let fakeFiles;
let fakeCount = 0;
let fakeText;
let timerText;
let timeLeft = 30;
let deletedTraces = 0;
let remainingText;
let lostText;
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
let gameEnded = false;
let goalReached = false;


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

    const frame = this.add.image(400, 300, "frame");

    player = this.physics.add.sprite(100, 300, "player");
    player.setScale(2);
    player.setInteractive();

    this.physics.world.setBounds(0, 0, 800, 600);
    player.setCollideWorldBounds(true);

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

    cursors = this.input.keyboard.createCursorKeys();

    files = this.physics.add.group();
    fakeFiles = this.physics.add.group();

    for (let i = 0; i < 10; i++) {
        spawnTrace();
    }

    timerText = this.add.text(565, 20, "Uploading In 0:30", {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "'Space Mono'"
    });

    deletedText = this.add.text(100, 20, "Deleted Remnants: 0 / 15", {
        fontSize: "12px",
        color: "#00f13c",
        fontFamily: "'Space Mono'"
    });

    fakeText = this.add.text(100, 40, "Upload Decoy: 0", {
        fontSize: "12px",
        color: "#00f13c",
        fontFamily: "'Space Mono'"
    });

    warningText = this.add.text(400, 80, "", {
        fontSize: "20px",
        color: "#ff5555",
        fontFamily: "'Space Mono'",
    }).setOrigin(0.5);

    warningBox = this.add.rectangle(400, 80, 300, 40, 0x000000);
    warningBox.setStrokeStyle(1, 0xffffff);
    warningBox.setVisible(false);
    warningBox.setDepth(1000);

    warningText.setVisible(false);
    warningText.setDepth(1001);

    thoughtBox = this.add.rectangle(400, 300, 420, 120, 0x000000);
    thoughtBox.setStrokeStyle(1, 0xffffff);
    thoughtBox.setVisible(false);
    thoughtBox.setDepth(1000);

    thoughtText = this.add.text(400, 300, "", {
        fontSize: "14px",
        color: "#ffffff",
        fontFamily: "'Space Mono'",
        align: "center",
        wordWrap: { width: 360 }
    }).setOrigin(0.5);

    thoughtText.setVisible(false);
    thoughtText.setDepth(1001);

    let savedThought = localStorage.getItem("lastThought");
    //console.log(savedThought);

    player.on("pointerdown", () => {
        thoughtVisible = !thoughtVisible;

        thoughtBox.setVisible(thoughtVisible);
        thoughtText.setVisible(thoughtVisible);

        let savedThought = localStorage.getItem("lastThought");

        if (savedThought) {
            thoughtText.setText("Archived thought:\n" + savedThought);
        } else {
            thoughtText.setText("No archived thought found.");
        }
    });

    this.physics.add.overlap(player, files, collectFile, null, this);

    robots = this.physics.add.group();

    this.anims.create({
        key: "robotWalk",
        frames: this.anims.generateFrameNumbers("robots", {
            start: 0,
            end: 7
        }),
        frameRate: 6,
        repeat: -1
    });

    for (let i = 0; i < 10; i++) {
        let robot = robots.create(
            Phaser.Math.Between(80, 720),
            Phaser.Math.Between(80, 520),
            "robots"
        );
        robot.setScale(2);
        robot.anims.play("robotWalk", true);
        robot.body.setCollideWorldBounds(true);
        robot.body.setBounce(0.2);

        if (i === 0) {
            hunterRobot = robot;
            robot.setTint(0xff8888);
            robot.targetFake = null;
        }

        moveRobot.call(this, robot);

    }

    this.physics.add.overlap(player, robots, hitRobot, null, this);
    this.physics.add.overlap(hunterRobot, fakeFiles, robotEatFake, null, this);

    this.anims.create({
        key: "doorOpen",
        frames: this.anims.generateFrameNumbers("door", {
            start: 0,
            end: 12
        }),
        frameRate: 12,
        repeat: -1
    });

    exitDoor = this.physics.add.sprite(400, 500, "door");
    exitDoor.setVisible(false);
    exitDoor.body.enable = false;

    this.time.delayedCall(2000, () => {
        playerInvincible = false;
    });

    this.time.addEvent({
        delay: 1000,
        repeat: 29,
        callback: () => {
            if (doorOpen || gameEnded) return;

            timeLeft--;
            timerText.setText("Uploading In 0:" + timeLeft);

            if (timeLeft <= 0) {
                doorOpen = true;
                robots.clear(true, true);
                files.clear(true, true);
                fakeFiles.clear(true, true);

                exitDoor.setVisible(true);
                exitDoor.body.enable = true;
                exitDoor.anims.play("doorOpen", true);

                warningText.setText("UPLOAD GATE OPEN");
                warningText.setVisible(true);
                warningBox.setVisible(true);
            }
        }
    });



}

function update() {
    player.body.setVelocity(0);

    if (hitCooldown) {
        return;
    }

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

    else {
        player.setVelocity(0);

        player.anims.stop();
    }


    robots.getChildren().forEach(function (robot) {

        if (robot === hunterRobot) {
            let targets = fakeFiles.getChildren().filter(f => f.active);

            if (targets.length > 0) {

                if (!robot.targetFake || !robot.targetFake.active) {
                    robot.targetFake = Phaser.Math.RND.pick(targets);
                }

                let angle = Phaser.Math.Angle.Between(
                    robot.x,
                    robot.y,
                    robot.targetFake.x,
                    robot.targetFake.y
                );

                let speed = 90 + robotSpeedBoost;

                robot.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            } else {
                robot.targetFake = null;
            }
        }
        if (robot.body.velocity.x < 0) {
            robot.setFlipX(true);
        } else if (robot.body.velocity.x > 0) {
            robot.setFlipX(false);
        }

        if (robot.body.velocity.length() < 5) {
            robot.anims.stop();
        } else {
            robot.anims.play("robotWalk", true);
        }
    });

}

function collectFile(player, file) {

    file.disableBody(true, false);

    this.tweens.add({
        targets: file,
        alpha: 0,
        scale: 0,
        duration: 200,
        onComplete: () => file.destroy()
    });

    deletedTraces++;

    if (deletedTraces === 5) {
        robotSpeedBoost = 80;

        let alertText = this.add.text(400, 550, "SURVEILLANCE INCREASED", {
            fontSize: "18px",
            color: "#fc0000",
            fontFamily: "'Space Mono'"
        }).setOrigin(0.5);

        alertText.setDepth(1001);

        this.tweens.add({
            targets: alertText,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 6
        });

        this.time.delayedCall(1200, () => {
            alertText.destroy();
        });
    }

    spawnFakeTrace(Phaser.Math.Between(80, 720), Phaser.Math.Between(80, 520));
    updateScoreText();

}

function spawnTrace() {
    let file = files.create(
        Phaser.Math.Between(80, 720),
        Phaser.Math.Between(80, 520),
        "trace"
    );

    file.setScale(0.3);

}

function spawnFakeTrace(x, y) {
    let fake = fakeFiles.create(x, y, "fake");
    fake.setScale(0.3);

}

function hitRobot(player, robot) {
    if (hitCooldown || playerInvincible) return;

    hitCooldown = true;

    player.setVelocity(0, 0);
    player.body.allowGravity = false;

    if (deletedTraces > 0) {

        deletedTraces--;
        spawnTrace();
        updateScoreText();

        let lostText = this.add.text(player.x, player.y - 20, "COLLECTED -1", {
            fontSize: "14px",
            color: "#ff0000",
            fontFamily: "'Space Mono'"
        }).setOrigin(0.5);
        lostText.setDepth(1001);

        this.tweens.add({
            targets: lostText,
            y: lostText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => lostText.destroy()
        });
    }

    player.setTint(0xff0000);

    warningText.setText("ARCHIVE BREACHED");
    warningText.setVisible(true);
    warningBox.setVisible(true);

    this.tweens.add({
        targets: [warningText, warningBox],
        x: '+=5',
        duration: 50,
        yoyo: true,
        repeat: 5
    });


    this.time.delayedCall(3000, () => {
        warningText.setVisible(false);
        warningBox.setVisible(false);
        hitCooldown = false;
        player.clearTint();
        player.body.allowGravity = true;

    });


}

function updateScoreText() {
    deletedText.setText("Deleted Remnants: " + deletedTraces + "/ 15");
}

function moveRobot(robot) {

    if (!robot || !robot.body || !robot.active) {
        return;
    }

    let isStop = Phaser.Math.Between(0, 10) > 8;

    if (isStop) {
        robot.body.setVelocity(0, 0);
        robot.anims.stop();
    } else {

        let angle = Phaser.Math.Between(0, 360);
        let speed = Phaser.Math.Between(100, 200) + robotSpeedBoost;

        this.physics.velocityFromAngle(angle, speed, robot.body.velocity);
        robot.anims.play("robotWalk", true);
    }


    this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
        if (!doorOpen && robot && robot.body && robot.active) {
            moveRobot.call(this, robot);
        }
    });
}

function robotEatFake(robot, fake) {

    if (!fake.active) return;

    fake.disableBody(true, false);

    this.tweens.add({
        targets: fake,
        alpha: 0,
        scale: 0,
        duration: 150,
        onComplete: () => fake.destroy()
    });

    fakeCount++;
    fakeText.setText("Fake Traces: " + fakeCount);

    robot.setTint(0xff4444);

    robot.targetFake = null;
}
