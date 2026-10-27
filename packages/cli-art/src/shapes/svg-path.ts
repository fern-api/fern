export interface Point {
    x: number;
    y: number;
}

/** A closed outline: the points of one flattened subpath. */
export type Polygon = Point[];

const CURVE_SEGMENTS = 12;
const COMMAND = /[MLHVCSQTAZ]/i;

/**
 * Flattens SVG path data into polygons, one per subpath. Supports every path command, absolute and
 * relative: M L H V C S Q T A Z.
 */
export function parseSvgPath(data: string): Polygon[] {
    const tokens = data.match(/[a-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? [];
    const polygons: Polygon[] = [];
    let polygon: Polygon = [];
    let index = 0;
    let command = "";
    let current: Point = { x: 0, y: 0 };
    let start: Point = { x: 0, y: 0 };
    let lastControl: Point | undefined;
    let lastCommand = "";

    const number = (): number => {
        const token = tokens[index++];
        const value = Number(token);
        if (token === undefined || Number.isNaN(value)) {
            throw new Error(`Invalid SVG path data near token ${index - 1}`);
        }
        return value;
    };
    // Arc flags are single digits that minifiers write without separators, as in "a1 1 0 00.5.5".
    const flag = (): boolean => {
        const token = tokens[index];
        if (token !== undefined && token.length > 1 && (token[0] === "0" || token[0] === "1")) {
            tokens[index] = token.slice(1);
            return token[0] === "1";
        }
        return number() !== 0;
    };
    const finishPolygon = (): void => {
        if (polygon.length > 2) {
            polygons.push(polygon);
        }
        polygon = [];
    };
    const lineTo = (point: Point): void => {
        polygon.push(point);
        current = point;
    };

    while (index < tokens.length) {
        const token = tokens[index] ?? "";
        if (COMMAND.test(token)) {
            command = token;
            index++;
            if (command === "Z" || command === "z") {
                finishPolygon();
                current = start;
                lastCommand = command;
                lastControl = undefined;
                continue;
            }
        } else if (command === "") {
            throw new Error("SVG path data must start with a command");
        }

        const relative = command === command.toLowerCase();
        const offset = (point: Point): Point => (relative ? { x: current.x + point.x, y: current.y + point.y } : point);
        const upper = command.toUpperCase();

        switch (upper) {
            case "M": {
                finishPolygon();
                const point = offset({ x: number(), y: number() });
                start = point;
                lineTo(point);
                // Coordinates after a moveto are implicit linetos.
                command = relative ? "l" : "L";
                lastControl = undefined;
                break;
            }
            case "L":
                lineTo(offset({ x: number(), y: number() }));
                lastControl = undefined;
                break;
            case "H": {
                const x = number();
                lineTo({ x: relative ? current.x + x : x, y: current.y });
                lastControl = undefined;
                break;
            }
            case "V": {
                const y = number();
                lineTo({ x: current.x, y: relative ? current.y + y : y });
                lastControl = undefined;
                break;
            }
            case "C": {
                const control1 = offset({ x: number(), y: number() });
                const control2 = offset({ x: number(), y: number() });
                const end = offset({ x: number(), y: number() });
                cubic(current, control1, control2, end).forEach(lineTo);
                lastControl = control2;
                break;
            }
            case "S": {
                const control1 = reflect(current, lastControl, /[CS]/i.test(lastCommand));
                const control2 = offset({ x: number(), y: number() });
                const end = offset({ x: number(), y: number() });
                cubic(current, control1, control2, end).forEach(lineTo);
                lastControl = control2;
                break;
            }
            case "Q": {
                const control = offset({ x: number(), y: number() });
                const end = offset({ x: number(), y: number() });
                quadratic(current, control, end).forEach(lineTo);
                lastControl = control;
                break;
            }
            case "T": {
                const control = reflect(current, lastControl, /[QT]/i.test(lastCommand));
                const end = offset({ x: number(), y: number() });
                quadratic(current, control, end).forEach(lineTo);
                lastControl = control;
                break;
            }
            case "A": {
                const radiusX = number();
                const radiusY = number();
                const rotation = number();
                const largeArc = flag();
                const sweep = flag();
                const end = offset({ x: number(), y: number() });
                arc(current, end, radiusX, radiusY, rotation, largeArc, sweep).forEach(lineTo);
                lastControl = undefined;
                break;
            }
            default:
                throw new Error(`Unsupported SVG path command: ${command}`);
        }
        lastCommand = command;
    }
    finishPolygon();
    return polygons;
}

function reflect(current: Point, control: Point | undefined, applies: boolean): Point {
    return applies && control !== undefined ? { x: 2 * current.x - control.x, y: 2 * current.y - control.y } : current;
}

function cubic(start: Point, control1: Point, control2: Point, end: Point): Point[] {
    return Array.from({ length: CURVE_SEGMENTS }, (_, step) => {
        const t = (step + 1) / CURVE_SEGMENTS;
        const inverse = 1 - t;
        return {
            x:
                inverse ** 3 * start.x +
                3 * inverse ** 2 * t * control1.x +
                3 * inverse * t ** 2 * control2.x +
                t ** 3 * end.x,
            y:
                inverse ** 3 * start.y +
                3 * inverse ** 2 * t * control1.y +
                3 * inverse * t ** 2 * control2.y +
                t ** 3 * end.y
        };
    });
}

function quadratic(start: Point, control: Point, end: Point): Point[] {
    return Array.from({ length: CURVE_SEGMENTS }, (_, step) => {
        const t = (step + 1) / CURVE_SEGMENTS;
        const inverse = 1 - t;
        return {
            x: inverse ** 2 * start.x + 2 * inverse * t * control.x + t ** 2 * end.x,
            y: inverse ** 2 * start.y + 2 * inverse * t * control.y + t ** 2 * end.y
        };
    });
}

/** Flattens an elliptical arc using the endpoint-to-center conversion from the SVG spec (F.6.5). */
function arc(
    start: Point,
    end: Point,
    radiusX: number,
    radiusY: number,
    rotationDegrees: number,
    largeArc: boolean,
    sweep: boolean
): Point[] {
    let rx = Math.abs(radiusX);
    let ry = Math.abs(radiusY);
    if (rx === 0 || ry === 0 || (start.x === end.x && start.y === end.y)) {
        return [end];
    }
    const phi = (rotationDegrees * Math.PI) / 180;
    const cos = Math.cos(phi);
    const sin = Math.sin(phi);
    const dx = (start.x - end.x) / 2;
    const dy = (start.y - end.y) / 2;
    const x1 = cos * dx + sin * dy;
    const y1 = -sin * dx + cos * dy;
    const scale = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
    if (scale > 1) {
        rx *= Math.sqrt(scale);
        ry *= Math.sqrt(scale);
    }
    const numerator = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
    const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1;
    const factor = (largeArc === sweep ? -1 : 1) * Math.sqrt(Math.max(0, numerator / denominator));
    const centerX1 = (factor * rx * y1) / ry;
    const centerY1 = (-factor * ry * x1) / rx;
    const centerX = cos * centerX1 - sin * centerY1 + (start.x + end.x) / 2;
    const centerY = sin * centerX1 + cos * centerY1 + (start.y + end.y) / 2;
    const angle = (ux: number, uy: number, vx: number, vy: number): number =>
        Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    const theta = angle(1, 0, (x1 - centerX1) / rx, (y1 - centerY1) / ry);
    let delta = angle((x1 - centerX1) / rx, (y1 - centerY1) / ry, (-x1 - centerX1) / rx, (-y1 - centerY1) / ry);
    if (!sweep && delta > 0) {
        delta -= 2 * Math.PI;
    } else if (sweep && delta < 0) {
        delta += 2 * Math.PI;
    }
    const segments = Math.max(4, Math.ceil((Math.abs(delta) / (Math.PI / 2)) * CURVE_SEGMENTS));
    return Array.from({ length: segments }, (_, step) => {
        const t = theta + (delta * (step + 1)) / segments;
        return {
            x: centerX + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
            y: centerY + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos
        };
    });
}

/** Nonzero-winding or even-odd point-in-polygons test across all subpaths of one shape. */
export function isInside(point: Point, polygons: Polygon[], fillRule: "nonzero" | "evenodd"): boolean {
    let winding = 0;
    let crossings = 0;
    for (const polygon of polygons) {
        for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
            const a = polygon[previous];
            const b = polygon[index];
            if (a === undefined || b === undefined) {
                continue;
            }
            if (a.y <= point.y) {
                if (b.y > point.y && cross(a, b, point) > 0) {
                    winding++;
                    crossings++;
                }
            } else if (b.y <= point.y && cross(a, b, point) < 0) {
                winding--;
                crossings++;
            }
        }
    }
    return fillRule === "evenodd" ? crossings % 2 === 1 : winding !== 0;
}

function cross(a: Point, b: Point, point: Point): number {
    return (b.x - a.x) * (point.y - a.y) - (point.x - a.x) * (b.y - a.y);
}
