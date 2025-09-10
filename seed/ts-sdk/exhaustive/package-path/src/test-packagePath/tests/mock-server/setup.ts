import { afterAll, beforeAll } from "@jest/globals";

import { mockServerPool } from "./MockServerPool.js";

beforeAll(() => {
    mockServerPool.listen();
});
afterAll(() => {
    mockServerPool.close();
});
