import { pool } from "../mock-server/MockServerPool";

beforeAll(() => {
    pool.listen();
});
afterAll(() => {
    pool.close();
});
