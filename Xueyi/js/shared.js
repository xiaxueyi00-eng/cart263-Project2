// Basic page setup
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.height = "100vh";

// System state variables
let dataIntensity = 0.05;   // controls scan brightness
let sharedLoad = 0;         // percentage progress
let nodes = [];             // store all nodes


// --- UI: Shared load display panel ---
function createControlPanel() {

    let panel = document.createElement("div");
    panel.style.position = "absolute";
    panel.style.top = "20px";
    panel.style.left = "20px";
    panel.style.color = "cyan";
    panel.style.fontFamily = "Space Mono";
    panel.style.fontSize = "20px";

    panel.innerHTML = `
        SHARED LOAD: <span id="load">0</span>%
    `;

    document.body.appendChild(panel);
}

// --- Update system state when nodes are activated ---
function updateSharedState() {


    // increase brightness intensity
    dataIntensity += 0.05;
    document.body.style.filter = `brightness(${1 + dataIntensity})`;


    if (dataIntensity > 0.8) {
        dataIntensity = 0.8;
    }

    // increase shared load
    sharedLoad += 10;
    if (sharedLoad > 100) sharedLoad = 100;

    document.getElementById("load").innerText = sharedLoad;

    // redirect when fully loaded
    if (sharedLoad >= 100) {
        setTimeout(() => {
            window.location.href = "shared.system.html";
        }, 800);
    }


}

// --- Node class (interactive data point) ---
class Node {

    constructor(x, y, size) {

        this.x = x;
        this.y = y;
        this.size = size;
        // click interaction
        this.nodeDiv = document.createElement("div");

        let self = this;

        this.nodeDiv.addEventListener("click", function () {
            // pulse effect
            self.nodeDiv.style.transform = "translate(-50%,-50%) scale(1.3)";
            self.nodeDiv.style.opacity = "0.3";

            setTimeout(() => {
                self.nodeDiv.style.transform = "translate(-50%,-50%) scale(1)";
            }, 200);

            updateSharedState();
        });
    }

    // render node to screen
    render() {

        document.body.appendChild(this.nodeDiv);


        this.nodeDiv.style.position = "absolute";
        this.nodeDiv.style.left = this.x + "px";
        this.nodeDiv.style.top = this.y + "px";
        this.nodeDiv.style.transform = "translate(-50%,-50%) scale(0)";
        this.nodeDiv.style.transition = "all 0.4s ease";

        this.nodeDiv.style.width = this.size + "px";
        this.nodeDiv.style.height = this.size + "px";
        this.nodeDiv.style.borderRadius = "50%";
        this.nodeDiv.style.backgroundColor = "cyan";

        // appear animation
        setTimeout(() => {
            this.nodeDiv.style.transform = "translate(-50%,-50%) scale(1)";
        }, 50);
    }
}
// --- Line class (connection between nodes) ---
class Line {

    constructor(startNode, endNode) {

        this.startNode = startNode;
        this.endNode = endNode;

        this.lineDiv = document.createElement("div");
    }
    render() {

        document.body.appendChild(this.lineDiv);

        let dx = this.endNode.x - this.startNode.x;
        let dy = this.endNode.y - this.startNode.y;

        let distance = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;

        this.lineDiv.style.position = "absolute";
        this.lineDiv.style.left = this.startNode.x + "px";
        this.lineDiv.style.top = this.startNode.y + "px";
        this.lineDiv.style.width = "0px";
        this.lineDiv.style.height = "3px";
        this.lineDiv.style.transformOrigin = "0 0";
        this.lineDiv.style.transform = `rotate(${angle}deg)`;
        this.lineDiv.style.transition = "width 0.3s ease";

        // Base color (stable cyan line)
        this.lineDiv.style.background = "cyan";
        this.lineDiv.style.boxShadow = "0 0 10px cyan";

        // Expand the line
        setTimeout(() => {
            this.lineDiv.style.width = distance + "px";
        }, 10);

        //  Lightning flashing effect
        let lightning = setInterval(() => {

            // Random flash between white and cyan
            this.lineDiv.style.background =
                Math.random() > 0.5 ? "white" : "cyan";

            this.lineDiv.style.boxShadow =
                "0 0 20px cyan, 0 0 40px white";

        }, 40);

        // Stop lightning after 0.4 seconds
        setTimeout(() => {
            clearInterval(lightning);
            this.lineDiv.style.background = "cyan";
            this.lineDiv.style.boxShadow = "0 0 10px cyan";
        }, 400);
    }

}


// --- Create initial network ---
function createNetwork() {

    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;

    let center = new Node(centerX, centerY, 80);
    center.render();
    center.nodeDiv.classList.add("core");
    nodes.push(center);
    // clicking center creates new nodes
    center.nodeDiv.addEventListener("click", function () {

        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;

        let newNode = new Node(x, y, 40);
        newNode.render();
        nodes.push(newNode);

        let newLine = new Line(center, newNode);
        newLine.render();
        lines.push(newLine);
    });
}

createNetwork();
createControlPanel();

