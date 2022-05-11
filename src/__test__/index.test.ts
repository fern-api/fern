import { convertToPostmanCollection } from "../index";

describe("index", () => {
    it("dummy", () => {
        convertToPostmanCollection({
            types: [],
            services: {
                http: [],
                websocket: [],
            },
            errors: [],
        });
    });
});
