/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as log from "./log";

const execAsync = promisify(exec);

export class CommandFailedException extends Error {
    constructor(message: string, cause?: Error) {
        super(message);
        this.name = "CommandFailedException";
        if (cause) {
            this.cause = cause;
        }
    }
}

export async function runCommand(command: string[], workingDirectory: string): Promise<void> {
    const commandString = command.join(" ");
    log.info(`Running command ${commandString}`);

    try {
        const [cmd, ...args] = command;
        const quotedArgs = args.map((arg) => {
            if (arg.includes(" ") || arg.includes("'") || arg.includes('"')) {
                return `"${arg.replace(/"/g, '\\"')}"`;
            }
            return arg;
        });
        const fullCommand = [cmd, ...quotedArgs].join(" ");

        const { stdout, stderr } = await execAsync(fullCommand, {
            cwd: workingDirectory
        });

        if (stdout) {
            log.info(stdout);
        }
        if (stderr) {
            log.error(stderr);
        }
    } catch (error) {
        log.error(`Encountered exception while running command ${commandString}`, error);
        throw new CommandFailedException(
            `Encountered exception while running command ${commandString}`,
            error as Error
        );
    }
}
