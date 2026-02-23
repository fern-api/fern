import { formatEndpointPathForSwift } from "../format-endpoint-path-for-swift.js";

// Pre-generated endpoint fixture data extracted from test-definitions IR.
// To regenerate: npx vitest run src/generators/client/util/__test__/generate-endpoint-fixtures.test.ts
import endpointFixtures from "./endpoint-fixtures.json";

const testDefinitionNames = Object.keys(endpointFixtures).sort();

describe.each(testDefinitionNames)("formatEndpointPathForSwift - %s", (testDefinitionName) => {
    // This allows us to conveniently review the formatted endpoint paths for every test definition in a single location

    it("correctly formats all endpoint paths for definition", () => {
        const fixture = endpointFixtures[testDefinitionName as keyof typeof endpointFixtures];
        const endpointPathsByService = Object.fromEntries(
            Object.entries(fixture.services).map(([serviceName, service]) => {
                return [
                    serviceName,
                    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                    service.endpoints.map((endpoint) => formatEndpointPathForSwift(endpoint as any))
                ] as const;
            })
        );
        const fileContents = Object.entries(endpointPathsByService)
            .map(([serviceName, paths]) => ({ serviceName, serviceContent: paths.map((p) => `"${p}"`).join("\n") }))
            .map(({ serviceName, serviceContent }) => `// ${serviceName}\n${serviceContent}`)
            .join("\n\n");
        expect(fileContents).toMatchSnapshot();
    });
});
