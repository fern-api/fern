import { afterAll, beforeAll } from "vitest";

import { mockServerPool } from "./MockServerPool.js";

beforeAll(() => {
    mockServerPool.listen();
});
afterAll(() => {
    mockServerPool.close();
});
