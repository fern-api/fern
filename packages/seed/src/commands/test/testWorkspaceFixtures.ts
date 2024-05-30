import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/configuration";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import fs from "fs";
import { difference } from "lodash-es";
import path from "path";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { printTestCases } from "./printTestCases";
import { TestRunner } from "./test-runner";

export const FIXTURES_TO_IGNORE = ["sever-sent-event-examples", "server-sent-event-examples"];

export const FIXTURES = readDirectories(path.join(__dirname, FERN_DIRECTORY, APIS_DIRECTORY)).filter(
    (fixture) => !FIXTURES_TO_IGNORE.includes(fixture)
);

export async function testGenerator({
    runner,
    generator,
    fixtures,
    outputFolder
}: {
    runner: TestRunner;
    generator: GeneratorWorkspace;
    fixtures: string[];
    outputFolder?: string;
}): Promise<boolean> {
    const testCases: Promise<TestRunner.TestResult>[] = [];
    for (const fixture of fixtures) {
        const config = generator.workspaceConfig.fixtures?.[fixture];
        if (config != null) {
            for (const instance of config) {
                if (outputFolder != null && instance.outputFolder !== outputFolder) {
                    continue;
                }
                testCases.push(
                    runner.run({
                        fixture,
                        configuration: instance
                    })
                );
            }
        } else {
            testCases.push(
                runner.run({
                    fixture,
                    configuration: undefined
                })
            );
        }
    }
    const results = await Promise.all(testCases);

    printTestCases(results);

    const failedFixtures = results
        .filter((res) => res.type === "failure")
        .map((res) => (res.id === res.outputFolder ? res.id : `${res.id}:${res.outputFolder}`));
    const unexpectedFixtures = difference(failedFixtures, generator.workspaceConfig.allowedFailures ?? []);

    if (failedFixtures.length === 0) {
        CONSOLE_LOGGER.info(`${results.length}/${results.length} test cases passed :white_check_mark:`);
    } else {
        CONSOLE_LOGGER.info(
            `${failedFixtures.length}/${
                results.length
            } test cases failed. The failed fixtures include ${failedFixtures.join(", ")}.`
        );
        if (unexpectedFixtures.length > 0) {
            CONSOLE_LOGGER.info(`Unexpected fixtures include ${unexpectedFixtures.join(", ")}.`);
            return false;
        } else {
            CONSOLE_LOGGER.info(`All failures were expected.`);
        }
    }
    return true;
}

function readDirectories(filepath: string): string[] {
    const files = fs.readdirSync(filepath);
    return files
        .map((file) => path.join(filepath, file))
        .filter((fullPath) => fs.statSync(fullPath).isDirectory())
        .map((fullPath) => path.basename(fullPath));
}
