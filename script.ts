const canvas = document.querySelector("canvas")!;
const rotation = (y: number) => [
    [Math.cos(y), 0, Math.sin(y)],
    [0, 1, 0],
    [-Math.sin(y), 0, Math.cos(y)],
];
const greeting = document.querySelector("#greeting") as HTMLElement;

type Vec3 = [number, number, number];

const WIDTH = 4;
const HEIGHT = 4;
const distance = 5;

const FORMATTER = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "full",
    timeZone: "Europe/Paris",
});

function onLoad() {
    const context = canvas.getContext("2d");
    const vertices: Vec3[] = [
        // Front vertices
        [-1.0, -1.0, 1.0],
        [1.0, -1.0, 1.0],
        [1.0, 1.0, 1.0],
        [-1.0, 1.0, 1.0],
        // Back vertices
        [-1.0, -1.0, -1.0],
        [1.0, -1.0, -1.0],
        [1.0, 1.0, -1.0],
        [-1.0, 1.0, -1.0],
    ];
    const edges = [
        // Front face
        [vertices[0], vertices[1]],
        [vertices[1], vertices[2]],
        [vertices[2], vertices[3]],
        [vertices[3], vertices[0]],
        // Back face
        [vertices[4], vertices[5]],
        [vertices[5], vertices[6]],
        [vertices[6], vertices[7]],
        [vertices[7], vertices[4]],
        // Diagonal
        [vertices[0], vertices[4]],
        [vertices[1], vertices[5]],
        [vertices[2], vertices[6]],
        [vertices[3], vertices[7]],
    ];
    if (context) {
        context.strokeStyle = "#fff49f";
        context.lineWidth = 2;
        let distance = 5.0;
        const render = (t: number) => {
            const rot = rotation((2 * Math.PI) / (3600 / (t % 3600)));
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (const [a, b] of edges) {
                context.beginPath();
                context.moveTo(
                    ...convert(
                        canvas,
                        project(
                            translate(matmul([a], rot)[0] as Vec3, [
                                0,
                                0,
                                distance,
                            ]),
                        ),
                    ),
                );
                context.lineTo(
                    ...convert(
                        canvas,
                        project(
                            translate(matmul([b], rot)[0] as Vec3, [
                                0,
                                0,
                                distance,
                            ]),
                        ),
                    ),
                );
                context.stroke();
            }
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        canvas.addEventListener("wheel", (event) => {
            console.log(event.deltaY);
            distance = Math.max(
                Math.min(distance + event.deltaY * 0.005, 20),
                4,
            );
            event.preventDefault();
        });
    }
    greeting.innerText = dispatchGreeting();
    initCaption();
}

function initCaption() {
    const name = document.querySelector("#full-name") as HTMLElement;
    const caption = document.querySelector("#full-name-caption") as HTMLElement;
    if (name && caption) {
        name.addEventListener("mouseenter", () => {
            caption.style.display = "flex";
            caption.style.opacity = "1";
        });
        name.addEventListener("mouseleave", () => {
            caption.style.display = "none";
            caption.style.opacity = "0";
        });
    }
}

function dispatchGreeting() {
    const parts = FORMATTER.formatToParts(new Date());
    const hour = parts
        .filter((part) => part["type"] === "hour")
        .map((part) => part["value"])
        .map((hour) => Number.parseInt(hour))[0]!;
    const period = parts
        .filter((part) => part["type"] === "dayPeriod")
        .map((part) => part["value"])[0]!;
    const month = parts
        .filter((part) => part["type"] === "month")
        .map((part) => part["value"])[0]!;
    const day = parts
        .filter((part) => part["type"] === "month")
        .map((part) => part["value"])
        .map((day) => Number.parseInt(day))[0]!;
    if (month === "December" && day >= 24 && day <= 25)
        return "Merry Christmas!";
    if (month === "November" && day === 9) return "Happy Birthday!";
    if (month === "October" && day === 8) return "Happy Birthday!";
    if (period === "AM" && hour >= 5) return "Good Morning!";
    if (period === "PM" && hour < 6) return "Good Afternoon!";
    if (period === "PM" && hour >= 6 && hour < 10) return "Good Evening!";
    return "Sleep tight!";
}

function translate(vertex: Vec3, offset: Vec3): Vec3 {
    return [
        vertex[0] + offset[0],
        vertex[1] + offset[1],
        vertex[2] + offset[2],
    ];
}

function matmul(a: number[][], b: number[][]): number[][] {
    const matrix = [];
    for (let x = 0; x < a.length; x++) {
        const column = [];
        for (let y = 0; y < b.length; y++) {
            let buffer = 0;
            for (let z = 0; z < b.length; z++) {
                buffer += a[x][z] * b[z][y];
            }
            column[y] = buffer;
        }
        matrix[x] = column;
    }
    return matrix;
}

function project(vertex: Vec3): [number, number] {
    return [
        (vertex[0] * distance) / vertex[2],
        (vertex[1] * distance) / vertex[2],
    ];
}

function convert(
    canvas: HTMLCanvasElement,
    viewport: [number, number],
): [number, number] {
    const cx = (viewport[0] * canvas.width) / WIDTH;
    const cy = (viewport[1] * canvas.height) / HEIGHT;
    return [canvas.width / 2 + cx, canvas.height / 2 - cy];
}

window.addEventListener("load", onLoad);
