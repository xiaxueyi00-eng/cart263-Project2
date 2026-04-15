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
let fileCount = 0;
let fileText;


function preload() {
    this.load.spritesheet("player", "image/16x32 Walk1.png", {
        frameWidth: 16,
        frameHeight: 32
    });

    this.load.image("frame", "image/background.png");

    this.load.image("trace", "image/trace.png");
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

        let file = this.physics.add.image(
            Phaser.Math.Between(80, 720),
            Phaser.Math.Between(80, 520),
            "trace"
        );
        file.setScale(0.3);
        this.physics.add.existing(file);
        files.add(file);
    }

    fileText = this.add.text(100, 20, "Deleted Traces: 0/10", {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "'Space Mono'",
        align: "center"
    });


    this.physics.add.overlap(player, files, collectFile, null, this);

}

function update() {
    player.body.setVelocity(0);

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

}

function collectFile(player, file) {
    file.destroy();
    fileCount++;
    fileText.setText("Deleted Traces: " + fileCount + " / 10");
}

