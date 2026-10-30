/** Small deterministic PRNG, so an animation looks the same on every run. */
export function mulberry32(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let value = Math.imul(state ^ (state >>> 15), 1 | state);
        value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

/** Deterministic noise in [-1, 1] for an index at a given frame. */
export function noise(index: number, frame: number, salt = 0): number {
    const value = Math.sin(index * 12.9898 + frame * 78.233 + salt * 37.719) * 43758.5453;
    return (value - Math.floor(value)) * 2 - 1;
}

export function shuffle<T>(items: T[], random: () => number): T[] {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
        const swap = Math.floor(random() * (index + 1));
        const current = result[index];
        const other = result[swap];
        if (current !== undefined && other !== undefined) {
            result[index] = other;
            result[swap] = current;
        }
    }
    return result;
}

export function clamp(value: number, min = 0, max = 1): number {
    return Math.min(max, Math.max(min, value));
}

export function easeOutCubic(value: number): number {
    return 1 - (1 - clamp(value)) ** 3;
}

export function easeInOutCubic(value: number): number {
    const t = clamp(value);
    return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export function rotateY(vector: Vector3, angle: number): Vector3 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: vector.x * cos + vector.z * sin, y: vector.y, z: -vector.x * sin + vector.z * cos };
}

export function rotateX(vector: Vector3, angle: number): Vector3 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: vector.x, y: vector.y * cos - vector.z * sin, z: vector.y * sin + vector.z * cos };
}

export function dot(left: Vector3, right: Vector3): number {
    return left.x * right.x + left.y * right.y + left.z * right.z;
}

export function normalize(vector: Vector3): Vector3 {
    const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
    return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}
