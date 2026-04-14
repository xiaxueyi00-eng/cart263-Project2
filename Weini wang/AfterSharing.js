const config = {
    type: Phaser.AUTO,
    width: innerWidth,
    height: innerHeight,
    backgroundColor: "#111111",
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
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

function preload() {

}

function create() {

    player = this.add.rectangle(100, 300, 40, 40, 0x00ffcc);
    this.physics.add.existing(player);

    player.body.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    player.body.setVelocity(0);

    if (cursors.left.isDown) {
        player.body.setVelocityX(-200);
    }
    else if (cursors.right.isDown) {
        player.body.setVelocityX(200);
    }

    if (cursors.up.isDown) {
        player.body.setVelocityY(-200);
    }
    else if (cursors.down.isDown) {
        player.body.setVelocityY(200);
    }
}