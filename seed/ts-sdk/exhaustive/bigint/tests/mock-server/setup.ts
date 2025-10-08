import { afterAll, beforeAll } from "@jest/globals";

import { mockServerPool } from "./MockServerPool";

beforeAll(() => {
    mockServerPool.listen();
});
afterAll(() => {
    mockServerPool.close();
});
