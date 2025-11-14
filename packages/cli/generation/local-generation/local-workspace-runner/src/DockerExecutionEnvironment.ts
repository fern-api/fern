import { ContainerRunner } from "@fern-api/core-utils";
import { ContainerExecutionEnvironment } from "./ContainerExecutionEnvironment";

/**
 * @deprecated Use ContainerExecutionEnvironment instead. This class is maintained for backward compatibility.
 */
export class DockerExecutionEnvironment extends ContainerExecutionEnvironment {
    constructor({
        dockerImage,
        keepDocker,
        runner
    }: {
        dockerImage: string;
        keepDocker: boolean;
        runner?: ContainerRunner;
    }) {
        super({
            containerImage: dockerImage,
            keepContainer: keepDocker,
            runner
        });
    }
}
