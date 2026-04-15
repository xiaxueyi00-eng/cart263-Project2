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
let remainingTraces = 10;
let deletedTraces = 0;
let remainingText;
let deletedText;
let robots;
let hitCooldown = false;



function preload() {
    this.load.spritesheet("player", "image/16x32 Walk1.png", {
        frameWidth: 16,
        frameHeight: 32
    });

    this.load.image("frame", "image/background.png");

    this.load.image("trace", "image/trace.png");

    this.load.spritesheet("robots", "image/robots.png", {
        frameWidth: 16,
        frameHeight: 19
    });
}

function create() {

    const frame = this.add.image(400, 300, "frame");

    player = this.physics.add.sprite(100, 300, "player");
    player.setScale(2);

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

    for (let i = 0; i < 10; i++) {
        spawnTrace();
    }

    remainingText = this.add.text(20, 20, "Remaining Traces: 10", {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "'Space Mono'"
    });

    deletedText = this.add.text(20, 40, "Deleted Traces: 0", {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "'Space Mono'"
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
        robot.body.setBounce(1, 1);

        let speedX = Phaser.Math.Between(-100, 100);
        let speedY = Phaser.Math.Between(-100, 100);

        if (speedX === 0) speedX = 50;
        if (speedY === 0) speedY = -50;

        robot.body.setVelocity(speedX, speedY);

    }

    this.physics.add.overlap(player, robots, hitRobot, null, this);
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

        if (robot.body.velocity.x < 0) {
            robot.setFlipX(true);
        } else if (robot.body.velocity.x > 0) {
            robot.setFlipX(false);
        }

    });


}

function collectFile(player, file) {
    file.destroy();

    remainingTraces--;
    deletedTraces++;

    updateScoreText();

    if (remainingTraces === 0 && !doorOpen) {
        openExitDoor();
    }
}

function spawnTrace() {
    let file = files.create(
        Phaser.Math.Between(80, 720),
        Phaser.Math.Between(80, 520),
        "trace"
    );

    file.setScale(0.3);
}

function hitRobot(player, robot) {
    if (hitCooldown) return;

    hitCooldown = true;

    player.setVelocity(0, 0);
    player.body.allowGravity = false;

    remainingTraces++;
    spawnTrace();
    updateScoreText();

    player.setTint(0xff0000);

    this.time.delayedCall(3000, () => {
        hitCooldown = false;

        player.clearTint();
        player.body.allowGravity = true;

    });
}

function updateScoreText() {
    remainingText.setText("Remaining Traces: " + remainingTraces);
    deletedText.setText("Deleted Traces: " + deletedTraces);
}