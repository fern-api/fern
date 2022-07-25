import yaml from "js-yaml";
import { substituteEnvVariables } from "../substituteEnvVariables";

describe("substituteEnvVariables", () => {
    it("basic", () => {
        process.env.ENV_VAR = "test";
        const rawYaml = `
        foo: bar
        baz: 
          qux: 
            thud: \${ENV_VAR}
        plugh: \${ENV_VAR}`;
        const parsedYaml = yaml.load(rawYaml);
        const substitutedYaml = substituteEnvVariables(parsedYaml);
        console.log(substitutedYaml);
        expect(substitutedYaml).toEqual({ foo: "bar", baz: { qux: { thud: "test" } }, plugh: "test" });
    });
});
