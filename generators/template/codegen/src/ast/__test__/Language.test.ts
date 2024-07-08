import { LANGUAGE_NAME } from "../..";

describe("LANGUAGE_NAME Language", () => {

    it("makes file", async () => {
        const output = LANGUAGE_NAME.makeFile({
            // Add your LANGUAGE_NAME specific functionality here
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

});
