import { DockerExecutionEnvironment } from "./DockerExecutionEnvironment";
import { GenerationRunner } from "./GenerationRunner";
import { NativeExecutionEnvironment } from "./NativeExecutionEnvironment";

export async function runContainerizedGenerationForSeed(
    args: GenerationRunner.RunArgs & {
        keepDocker: boolean;
        dockerImage: string;
    }
): Promise<void> {
    const executionEnv = new DockerExecutionEnvironment({
        dockerImage: args.dockerImage,
        keepDocker: args.keepDocker,
        runner: "podman"
    });
    const runner = new GenerationRunner(executionEnv);
    await runner.run(args);
}

export async function runNativeGenerationForSeed(
    args: GenerationRunner.RunArgs,
    commands: string[],
    workingDirectory?: string
): Promise<void> {
    const executionEnv = new NativeExecutionEnvironment({ commands, workingDirectory });
    const runner = new GenerationRunner(executionEnv);
    await runner.run(args);
}

export async function runNativeGenerationWithCommand(args: GenerationRunner.RunArgs, command: string): Promise<void> {
    return runNativeGenerationForSeed(args, [command]);
}
