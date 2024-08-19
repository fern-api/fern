import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER, LogLevel, LOG_LEVELS } from "@fern-api/logger";
import { askToLogin } from "@fern-api/login";
import { FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { registerCliRelease } from "./commands/register/registerCliRelease";
import { registerGenerator } from "./commands/register/registerGenerator";
import { runWithCustomFixture } from "./commands/run/runWithCustomFixture";
import { ScriptRunner } from "./commands/test/ScriptRunner";
import { TaskContextFactory } from "./commands/test/TaskContextFactory";
import { DockerTestRunner, LocalTestRunner } from "./commands/test/test-runner";
import { FIXTURES, testGenerator } from "./commands/test/testWorkspaceFixtures";
import { GeneratorWorkspace, loadGeneratorWorkspaces } from "./loadGeneratorWorkspaces";
import { Semaphore } from "./Semaphore";

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv))
        .strict()
        .fail((message, error: unknown, argv) => {
            // if error is null, it's a yargs validation error
            if (error == null) {
                argv.showHelp();
                // eslint-disable-next-line
                console.error(message);
            }
        });

    addTestCommand(cli);
    addRunCommand(cli);
    addRegisterCommand(cli);

    await cli.parse();

    CONSOLE_LOGGER.info("Seed has finished...");
}

function addTestCommand(cli: Argv) {
    cli.command(
        "test",
        "Run all snapshot tests for the generators",
        (yargs) =>
            yargs
                .option("generator", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    alias: "g",
                    description: "The generators to run tests for"
                })
                .option("parallel", {
                    type: "number",
                    default: 4,
                    alias: "p"
                })
                .option("fixture", {
                    type: "array",
                    string: true,
                    default: FIXTURES,
                    choices: FIXTURES,
                    demandOption: false,
                    description: "Runs on all fixtures if not provided"
                })
                .option("outputFolder", {
                    string: true,
                    demandOption: false,
                    description: "Runs on a specific output folder. Only relevant if there are >1 folders configured."
                })
                .option("keepDocker", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    description: "Keeps the docker container after the tests are finished"
                })
                .option("skip-scripts", {
                    type: "boolean",
                    demandOption: false,
                    default: false
                })
                .option("local", {
                    type: "boolean",
                    demandOption: false,
                    default: false
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            if (argv.generator != null) {
                throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: argv.generator });
            }

            const taskContextFactory = new TaskContextFactory(argv["log-level"]);
            const lock = new Semaphore(argv.parallel);
            const tests: Promise<boolean>[] = [];
            const scriptRunners: ScriptRunner[] = [];

            for (const generator of generators) {
                if (argv.generator != null && !argv.generator.includes(generator.workspaceName)) {
                    continue;
                }
                let testRunner;
                const scriptRunner = new ScriptRunner(generator, argv.skipScripts);
                if (argv.local && generator.workspaceConfig.local != null) {
                    testRunner = new LocalTestRunner({
                        generator,
                        lock,
                        taskContextFactory,
                        skipScripts: argv.skipScripts,
                        scriptRunner: scriptRunner,
                        keepDocker: false // dummy
                    });
                } else {
                    testRunner = new DockerTestRunner({
                        generator,
                        lock,
                        taskContextFactory,
                        skipScripts: argv.skipScripts,
                        keepDocker: argv.keepDocker,
                        scriptRunner: scriptRunner
                    });
                }

                tests.push(
                    testGenerator({
                        generator,
                        runner: testRunner,
                        fixtures: argv.fixture,
                        outputFolder: argv.outputFolder
                    })
                );
            }

            const results = await Promise.all(tests);

            for (const scriptRunner of scriptRunners) {
                await scriptRunner.stop();
            }

            // If any of the tests failed, exit with a non-zero status code
            if (results.includes(false)) {
                process.exit(1);
            }
        }
    );
}

function addRunCommand(cli: Argv) {
    cli.command(
        "run",
        "Runs the generator on the given input",
        (yargs) =>
            yargs
                .option("generator", {
                    string: true,
                    demandOption: true,
                    description: "Generator to run"
                })
                .option("path", {
                    type: "string",
                    string: true,
                    demandOption: true,
                    description: "Path to the fern definition"
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                })
                .option("audience", {
                    string: true,
                    demandOption: false
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: [argv.generator] });

            const generator = generators.find((g) => g.workspaceName === argv.generator);
            if (generator == null) {
                throw new Error(
                    `Generator ${argv.generator} not found. Please make sure that there is a folder with the name ${argv.generator} in the seed directory.`
                );
            }

            await runWithCustomFixture({
                pathToFixture: argv.path.startsWith("/")
                    ? AbsoluteFilePath.of(argv.path)
                    : join(AbsoluteFilePath.of(process.cwd()), RelativeFilePath.of(argv.path)),
                workspace: generator,
                logLevel: argv["log-level"],
                audience: argv.audience
            });
        }
    );
}

function addRegisterCommand(cli: Argv) {
    cli.command(
        "register",
        "Registers all of the generators, as well as the CLI to FDR unless otherwise specified. To filter to certain generators or to not include the CLI, use the --generator, and --skip-cli flags respectively.",
        (yargs) =>
            yargs
                .option("generator", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    description: "Generator(s) to register"
                })
                .option("skip-cli", {
                    boolean: true,
                    description: "Initialize a docs website."
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            if (argv.generator != null) {
                throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: argv.generator });
            }
            const taskContextFactory = new TaskContextFactory(argv["log-level"]);
            const context = taskContextFactory.create("Register");
            const token = await askToLogin(context);

            const fdrClient = createFdrService({ token: token.value });

            await registerCliRelease({
                fdrClient,
                context: taskContextFactory.create("Register")
            });
            for (const generator of generators) {
                if (argv.generator != null && !argv.generator.includes(generator.workspaceName)) {
                    continue;
                }
                // Register the generator and it's versions
                await registerGenerator({
                    generator,
                    fdrClient,
                    context
                });
            }
        }
    );
}

function throwIfGeneratorDoesNotExist({
    seedWorkspaces,
    generators
}: {
    seedWorkspaces: GeneratorWorkspace[];
    generators: string[];
}) {
    const generatorNames = new Set(
        seedWorkspaces.map((gen) => {
            return gen.workspaceName;
        })
    );
    const missingGenerators = [];
    for (const generator of generators) {
        if (!generatorNames.has(generator)) {
            missingGenerators.push(generator);
        }
    }
    if (missingGenerators.length > 0) {
        throw new Error(
            `Generators ${missingGenerators.join(
                ", "
            )} not found. Please make sure that there is a folder with those names in the seed directory.`
        );
    }
}

// Dummy clone of the function from @fern-api/core
// because we're using different SDKs for these packages
function createFdrService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token
}: {
    environment?: string;
    token: (() => string) | string;
}): FdrClient {
    return new FdrClient({
        environment,
        token
    });
}
