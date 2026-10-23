import { mix, parseColor, type Rgb } from "../core/color";
import { isInside, type Point, type Polygon, parseSvgPath } from "./svg-path";

/** How a filled region is colored: a flat color, or a linear or radial gradient. */
export type Fill = { kind: "solid"; color: Rgb } | GradientFill;

export interface GradientStop {
    offset: number;
    color: Rgb;
}

/**
 * A gradient, with its geometry mapped into document coordinates: `toGradient` takes a document
 * point to the gradient's own space, where a linear gradient runs from `from` to `to` and a radial
 * gradient spreads from `center` out to `radius`. Bounding-box gradients are relative to the shape's
 * bounds, so they are mapped at lookup time.
 */
export type GradientFill = {
    kind: "linear" | "radial";
    stops: GradientStop[];
    units: "objectBoundingBox" | "userSpaceOnUse";
    toGradient: Matrix;
    from: Point;
    to: Point;
    center: Point;
    radius: number;
};

/** One filled region of an SVG, in document coordinates. */
export interface SvgLayer {
    polygons: Polygon[];
    fill: Fill;
    fillRule: "nonzero" | "evenodd";
    bounds: Bounds;
}

export interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export interface SvgDocument {
    layers: SvgLayer[];
    /** The area to draw: the viewBox, or the bounds of everything drawn. */
    viewBox: Bounds;
}

export type Matrix = [number, number, number, number, number, number];

interface Context {
    matrix: Matrix;
    fill: string | undefined;
    fillRule: string | undefined;
    opacity: number;
}

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
const SHAPE_TAGS = new Set(["path", "rect", "circle", "ellipse", "polygon", "polyline"]);
const HIDDEN_CONTAINERS = new Set(["defs", "clippath", "mask", "symbol", "pattern", "marker"]);

/**
 * Parses the filled shapes of an SVG: paths and basic shapes, with fills inherited from groups,
 * transforms, and linear or radial gradient fills (kept as their color stops). Strokes, text, and
 * images are ignored.
 */
export function parseSvg(source: string): SvgDocument {
    const gradients = parseGradients(source);
    const layers: SvgLayer[] = [];
    const stack: Context[] = [{ matrix: IDENTITY, fill: undefined, fillRule: undefined, opacity: 1 }];
    let hiddenDepth = 0;
    let viewBox: Bounds | undefined;

    for (const match of source.matchAll(/<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g)) {
        const closing = match[1] === "/";
        const tag = (match[2] ?? "").toLowerCase();
        const attributes = parseAttributes(match[3] ?? "");
        const selfClosing = match[4] === "/";

        if (HIDDEN_CONTAINERS.has(tag)) {
            if (closing) {
                hiddenDepth = Math.max(0, hiddenDepth - 1);
            } else if (!selfClosing) {
                hiddenDepth++;
            }
            continue;
        }
        if (hiddenDepth > 0) {
            continue;
        }
        const parent = stack[stack.length - 1] ?? {
            matrix: IDENTITY,
            fill: undefined,
            fillRule: undefined,
            opacity: 1
        };

        if (tag === "svg" && !closing) {
            viewBox ??= parseViewBox(attributes);
            if (!selfClosing) {
                stack.push(childContext(parent, attributes));
            }
            continue;
        }
        if (tag === "g" || tag === "svg" || tag === "a") {
            if (closing) {
                stack.pop();
            } else if (!selfClosing) {
                stack.push(childContext(parent, attributes));
            }
            continue;
        }
        if (closing || !SHAPE_TAGS.has(tag)) {
            continue;
        }

        const context = childContext(parent, attributes);
        if (context.opacity < 0.05 || context.fill === "none" || context.fill === "transparent") {
            continue;
        }
        const fill = resolveFill(context.fill ?? "black", gradients, context.matrix, viewBox);
        const polygons = shapePolygons(tag, attributes).map((polygon) =>
            polygon.map((point) => transform(context.matrix, point))
        );
        if (fill === undefined || polygons.length === 0) {
            continue;
        }
        layers.push({
            polygons,
            fill,
            fillRule: context.fillRule === "evenodd" ? "evenodd" : "nonzero",
            bounds: boundsOf(polygons)
        });
    }

    const drawn =
        layers.length === 0 ? { minX: 0, minY: 0, maxX: 1, maxY: 1 } : unionBounds(layers.map((layer) => layer.bounds));
    return { layers, viewBox: viewBox ?? drawn };
}

/** The color of the topmost layer covering a point, if any. */
export function colorAt(document: SvgDocument, point: Point): Rgb | undefined {
    for (let index = document.layers.length - 1; index >= 0; index--) {
        const layer = document.layers[index];
        if (layer === undefined) {
            continue;
        }
        const { bounds } = layer;
        if (point.x < bounds.minX || point.x > bounds.maxX || point.y < bounds.minY || point.y > bounds.maxY) {
            continue;
        }
        if (isInside(point, layer.polygons, layer.fillRule)) {
            return fillColor(layer, point);
        }
    }
    return undefined;
}

function fillColor(layer: SvgLayer, point: Point): Rgb {
    const { fill, bounds } = layer;
    if (fill.kind === "solid") {
        return fill.color;
    }
    // Bounding-box units are fractions of the shape's bounds (here, its bounds on the page).
    const local =
        fill.units === "objectBoundingBox"
            ? {
                  x: (point.x - bounds.minX) / Math.max(1e-9, bounds.maxX - bounds.minX),
                  y: (point.y - bounds.minY) / Math.max(1e-9, bounds.maxY - bounds.minY)
              }
            : point;
    const position = transform(fill.toGradient, local);
    if (fill.kind === "radial") {
        const distance = Math.hypot(position.x - fill.center.x, position.y - fill.center.y);
        return colorAtOffset(fill.stops, distance / Math.max(1e-9, fill.radius));
    }
    const direction = { x: fill.to.x - fill.from.x, y: fill.to.y - fill.from.y };
    const length = direction.x * direction.x + direction.y * direction.y;
    const t =
        length < 1e-12
            ? 0
            : ((position.x - fill.from.x) * direction.x + (position.y - fill.from.y) * direction.y) / length;
    return colorAtOffset(fill.stops, t);
}

function colorAtOffset(stops: GradientStop[], offset: number): Rgb {
    const first = stops[0];
    if (first === undefined) {
        return [0, 0, 0];
    }
    if (offset <= first.offset) {
        return first.color;
    }
    for (let index = 1; index < stops.length; index++) {
        const previous = stops[index - 1] ?? first;
        const next = stops[index] ?? previous;
        if (offset <= next.offset) {
            const span = next.offset - previous.offset;
            return span <= 0 ? next.color : mix(previous.color, next.color, (offset - previous.offset) / span);
        }
    }
    return stops[stops.length - 1]?.color ?? first.color;
}

function childContext(parent: Context, attributes: Record<string, string>): Context {
    const style = parseStyle(attributes.style ?? "");
    const opacity =
        Number(style.opacity ?? attributes.opacity ?? "1") *
        Number(style["fill-opacity"] ?? attributes["fill-opacity"] ?? "1");
    return {
        matrix:
            attributes.transform === undefined
                ? parent.matrix
                : multiply(parent.matrix, parseTransform(attributes.transform)),
        fill: style.fill ?? attributes.fill ?? parent.fill,
        fillRule: style["fill-rule"] ?? attributes["fill-rule"] ?? parent.fillRule,
        opacity: parent.opacity * (Number.isNaN(opacity) ? 1 : opacity)
    };
}

function resolveFill(
    value: string,
    gradients: Map<string, GradientDefinition>,
    matrix: Matrix,
    viewBox: Bounds | undefined
): Fill | undefined {
    const reference = value.match(/url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/);
    if (reference !== null) {
        const found = gradients.get(reference[1] ?? "");
        if (found === undefined || found.stops.length === 0) {
            return undefined;
        }
        if (found.stops.length === 1) {
            return { kind: "solid", color: found.stops[0]?.color ?? [0, 0, 0] };
        }
        return gradientFill(found, matrix, viewBox);
    }
    if (value === "currentColor") {
        return { kind: "solid", color: [0, 0, 0] };
    }
    const color = parseColor(value);
    return color === undefined ? undefined : { kind: "solid", color };
}

interface GradientDefinition {
    kind: "linear" | "radial";
    stops: GradientStop[];
    attributes: Record<string, string>;
}

function gradientFill(definition: GradientDefinition, matrix: Matrix, viewBox: Bounds | undefined): GradientFill {
    const { attributes } = definition;
    const units = attributes.gradientUnits === "userSpaceOnUse" ? "userSpaceOnUse" : "objectBoundingBox";
    const width = viewBox === undefined ? 1 : viewBox.maxX - viewBox.minX;
    const height = viewBox === undefined ? 1 : viewBox.maxY - viewBox.minY;
    // Percentages are of the bounding box, or of the viewport in user space.
    const length = (name: string, fallback: string, scale: number): number => {
        const raw = (attributes[name] ?? fallback).trim();
        const value = Number.parseFloat(raw);
        if (Number.isNaN(value)) {
            return Number.parseFloat(fallback) / (fallback.endsWith("%") ? 100 : 1);
        }
        if (!raw.endsWith("%")) {
            return value;
        }
        return (value / 100) * (units === "userSpaceOnUse" ? scale : 1);
    };
    const gradientTransform =
        attributes.gradientTransform === undefined ? IDENTITY : parseTransform(attributes.gradientTransform);
    // User-space gradients live in the coordinates of the shape using them, so they follow its transforms.
    const toPage = units === "userSpaceOnUse" ? multiply(matrix, gradientTransform) : gradientTransform;
    const center = { x: length("cx", "50%", width), y: length("cy", "50%", height) };
    return {
        kind: definition.kind,
        stops: definition.stops,
        units,
        toGradient: invert(toPage),
        from: { x: length("x1", "0%", width), y: length("y1", "0%", height) },
        to: { x: length("x2", "100%", width), y: length("y2", "0%", height) },
        center,
        radius: length("r", "50%", Math.hypot(width, height) / Math.SQRT2)
    };
}

/** Gradient definitions by id, following `href` references to inherit stops and attributes. */
function parseGradients(source: string): Map<string, GradientDefinition> {
    const raw = new Map<string, GradientDefinition & { href?: string }>();
    for (const match of source.matchAll(/<(linearGradient|radialGradient)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/gi)) {
        const attributes = parseAttributes(match[2] ?? "");
        const id = attributes.id;
        if (id === undefined) {
            continue;
        }
        const stops: GradientStop[] = [];
        for (const stop of (match[3] ?? "").matchAll(/<stop\b([^>]*?)\/?>/gi)) {
            const stopAttributes = parseAttributes(stop[1] ?? "");
            const style = parseStyle(stopAttributes.style ?? "");
            const color = parseColor(style["stop-color"] ?? stopAttributes["stop-color"] ?? "black");
            const rawOffset = (style.offset ?? stopAttributes.offset ?? "0").trim();
            const offset = Number.parseFloat(rawOffset) / (rawOffset.endsWith("%") ? 100 : 1);
            if (color !== undefined) {
                // Offsets never go backwards: a smaller one is treated as equal to the one before.
                const previous = stops[stops.length - 1]?.offset ?? 0;
                stops.push({ offset: Math.max(previous, Math.min(1, Number.isNaN(offset) ? 0 : offset)), color });
            }
        }
        const href = (attributes.href ?? attributes["xlink:href"])?.replace(/^#/, "");
        raw.set(id, {
            kind: (match[1] ?? "").toLowerCase() === "radialgradient" ? "radial" : "linear",
            stops,
            attributes,
            href
        });
    }
    const resolved = new Map<string, GradientDefinition>();
    for (const [id, gradient] of raw) {
        let { stops, attributes } = gradient;
        let href = gradient.href;
        for (let depth = 0; href !== undefined && depth < 5; depth++) {
            const referenced = raw.get(href);
            if (referenced === undefined) {
                break;
            }
            stops = stops.length > 0 ? stops : referenced.stops;
            attributes = { ...referenced.attributes, ...attributes };
            href = referenced.href;
        }
        resolved.set(id, { kind: gradient.kind, stops, attributes });
    }
    return resolved;
}

function shapePolygons(tag: string, attributes: Record<string, string>): Polygon[] {
    const number = (name: string, fallback = 0): number => {
        const value = Number.parseFloat(attributes[name] ?? "");
        return Number.isNaN(value) ? fallback : value;
    };
    switch (tag) {
        case "path":
            return attributes.d === undefined ? [] : parseSvgPath(attributes.d);
        case "rect": {
            const x = number("x");
            const y = number("y");
            const width = number("width");
            const height = number("height");
            const rx = Math.min(width / 2, number("rx", number("ry")));
            const ry = Math.min(height / 2, number("ry", rx));
            if (width <= 0 || height <= 0) {
                return [];
            }
            if (rx <= 0 || ry <= 0) {
                return [
                    [
                        { x, y },
                        { x: x + width, y },
                        { x: x + width, y: y + height },
                        { x, y: y + height }
                    ]
                ];
            }
            return parseSvgPath(
                `M${x + rx},${y} H${x + width - rx} A${rx},${ry} 0 0 1 ${x + width},${y + ry} V${y + height - ry} A${rx},${ry} 0 0 1 ${x + width - rx},${y + height} H${x + rx} A${rx},${ry} 0 0 1 ${x},${y + height - ry} V${y + ry} A${rx},${ry} 0 0 1 ${x + rx},${y} Z`
            );
        }
        case "circle":
            return [ellipse(number("cx"), number("cy"), number("r"), number("r"))];
        case "ellipse":
            return [ellipse(number("cx"), number("cy"), number("rx"), number("ry"))];
        case "polygon":
        case "polyline": {
            const values = (attributes.points ?? "").match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? [];
            const points: Polygon = [];
            for (let index = 0; index + 1 < values.length; index += 2) {
                points.push({ x: Number(values[index]), y: Number(values[index + 1]) });
            }
            return points.length > 2 ? [points] : [];
        }
        default:
            return [];
    }
}

function ellipse(cx: number, cy: number, rx: number, ry: number): Polygon {
    if (rx <= 0 || ry <= 0) {
        return [];
    }
    return Array.from({ length: 48 }, (_, step) => {
        const angle = (step / 48) * 2 * Math.PI;
        return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
    });
}

function parseViewBox(attributes: Record<string, string>): Bounds | undefined {
    const values = (attributes.viewBox ?? attributes.viewbox ?? "")
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
    if (
        values.length === 4 &&
        values.every((value) => !Number.isNaN(value)) &&
        (values[2] ?? 0) > 0 &&
        (values[3] ?? 0) > 0
    ) {
        const [minX = 0, minY = 0, width = 1, height = 1] = values;
        return { minX, minY, maxX: minX + width, maxY: minY + height };
    }
    const width = Number.parseFloat(attributes.width ?? "");
    const height = Number.parseFloat(attributes.height ?? "");
    return width > 0 && height > 0 ? { minX: 0, minY: 0, maxX: width, maxY: height } : undefined;
}

function parseAttributes(text: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    for (const match of text.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
        attributes[match[1] ?? ""] = match[2] ?? match[3] ?? "";
    }
    return attributes;
}

function parseStyle(style: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const declaration of style.split(";")) {
        const [property, ...rest] = declaration.split(":");
        if (property !== undefined && rest.length > 0) {
            result[property.trim().toLowerCase()] = rest.join(":").trim();
        }
    }
    return result;
}

function parseTransform(value: string): Matrix {
    let matrix: Matrix = IDENTITY;
    for (const match of value.matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g)) {
        const args = (match[2] ?? "")
            .split(/[\s,]+/)
            .filter(Boolean)
            .map(Number);
        const [a = 0, b, c, d, e, f] = args;
        let next: Matrix = IDENTITY;
        switch (match[1]) {
            case "matrix":
                next = [a, b ?? 0, c ?? 0, d ?? 1, e ?? 0, f ?? 0];
                break;
            case "translate":
                next = [1, 0, 0, 1, a, b ?? 0];
                break;
            case "scale":
                next = [a, 0, 0, b ?? a, 0, 0];
                break;
            case "rotate": {
                const radians = (a * Math.PI) / 180;
                const cos = Math.cos(radians);
                const sin = Math.sin(radians);
                const cx = b ?? 0;
                const cy = c ?? 0;
                next = [cos, sin, -sin, cos, cx - cos * cx + sin * cy, cy - sin * cx - cos * cy];
                break;
            }
            case "skewX":
                next = [1, 0, Math.tan((a * Math.PI) / 180), 1, 0, 0];
                break;
            case "skewY":
                next = [1, Math.tan((a * Math.PI) / 180), 0, 1, 0, 0];
                break;
            default:
                break;
        }
        matrix = multiply(matrix, next);
    }
    return matrix;
}

function multiply([a1, b1, c1, d1, e1, f1]: Matrix, [a2, b2, c2, d2, e2, f2]: Matrix): Matrix {
    return [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1
    ];
}

function invert([a, b, c, d, e, f]: Matrix): Matrix {
    const determinant = a * d - b * c;
    if (Math.abs(determinant) < 1e-12) {
        return IDENTITY;
    }
    return [
        d / determinant,
        -b / determinant,
        -c / determinant,
        a / determinant,
        (c * f - d * e) / determinant,
        (b * e - a * f) / determinant
    ];
}

function transform([a, b, c, d, e, f]: Matrix, point: Point): Point {
    return { x: a * point.x + c * point.y + e, y: b * point.x + d * point.y + f };
}

function boundsOf(polygons: Polygon[]): Bounds {
    const points = polygons.flat();
    return {
        minX: Math.min(...points.map((point) => point.x)),
        minY: Math.min(...points.map((point) => point.y)),
        maxX: Math.max(...points.map((point) => point.x)),
        maxY: Math.max(...points.map((point) => point.y))
    };
}

function unionBounds(bounds: Bounds[]): Bounds {
    return {
        minX: Math.min(...bounds.map((bound) => bound.minX)),
        minY: Math.min(...bounds.map((bound) => bound.minY)),
        maxX: Math.max(...bounds.map((bound) => bound.maxX)),
        maxY: Math.max(...bounds.map((bound) => bound.maxY))
    };
}
