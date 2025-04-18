import chalk from "chalk";
import inquirer from "inquirer";

import { addPrefixToString } from "@fern-api/core-utils";
import { InteractiveTaskContext, Startable, TaskContext, TaskResult } from "@fern-api/task-context";

import { getMigrationsToRun } from "./migrations/getMigrationsToRun";
import { Migration } from "./types/Migration";
import { VersionMigrations } from "./types/VersionMigrations";

interface MigrationWithTaskContext {
    migration: Migration;
    context: Startable<InteractiveTaskContext>;
}

export declare namespace runMigrations {
    export interface Args {
        fromVersion: string;
        toVersion: string;
        context: TaskContext;
    }
}

export async function runMigrations({ fromVersion, toVersion, context }: runMigrations.Args): Promise<void> {
    context.logger.debug(`Checking if any migrations need to be run (from=${fromVersion}, to=${toVersion})`);

    const migrationsToRun = getMigrationsToRun({ fromVersion, toVersion });

    if (migrationsToRun.length === 0) {
        context.logger.debug("No migrations needed.");
        return;
    } else {
        context.logger.debug(
            "Migrations need to be run:\n" +
                migrationsToRun
                    .flatMap(({ migrations }) => migrations.map((migration) => `  - ${migration.name}`))
                    .join("\n")
        );
    }

    await context.takeOverTerminal(async () => {
        const wantsToContinue = await askForConfirmation(migrationsToRun);
        if (!wantsToContinue) {
            context.failAndThrow("Canceled.");
        }
    });
    if (context.getResult() === TaskResult.Failure) {
        return;
    }

    const migrationsWithTasks = migrationsToRun.flatMap(({ migrations, version }) =>
        migrations.map(
            (migration): MigrationWithTaskContext => ({
                migration,
                context: context.addInteractiveTask({ name: `${version} ${migration.name}` })
            })
        )
    );

    for (const { migration, context: contextForMigration } of migrationsWithTasks) {
        const finishableContext = contextForMigration.start();
        await migration.run({
            context: finishableContext
        });
        finishableContext.finish();
        if (finishableContext.getResult() === TaskResult.Failure) {
            context.logger.error("Failed to run migrations. You may need to undo changes to files.");
            return;
        }
    }
}

async function askForConfirmation(migrationsToRun: VersionMigrations[]): Promise<boolean> {
    const QUESTION_KEY = "wantsToContinue";

    const lines = ["Some migrations need to be run:"];
    for (const { migrations } of migrationsToRun) {
        for (const migration of migrations) {
            lines.push(
                addPrefixToString({
                    prefix: "  ◦ ",
                    content: `${migration.name}\n${chalk.dim(migration.summary)}`
                })
            );
        }
    }
    lines.push("Do you wish to continue?");

    const { [QUESTION_KEY]: wantsToContinue } = await inquirer.prompt<{ [QUESTION_KEY]: boolean }>({
        name: QUESTION_KEY,
        type: "confirm",
        message: lines.join("\n")
    });

    return wantsToContinue;
}
