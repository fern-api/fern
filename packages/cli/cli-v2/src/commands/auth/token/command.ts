import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { createVenusService } from "@fern-api/core";
import { FernVenusApi } from "@fern-api/venus-api-sdk";
import type { Argv } from "yargs";

import { TaskContextAdapter } from "../../../context/adapter/TaskContextAdapter";
import type { Context } from "../../../context/Context";
import type { GlobalArgs } from "../../../context/GlobalArgs";
import { CliError } from "../../../errors/CliError";
import { Icons } from "../../../ui/format";
import { command } from "../../_internal/command";

interface TokenArgs extends GlobalArgs {
    org?: string;
}

export function addTokenCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "token", "Generate an organization access token (FERN_TOKEN)", handleToken, (yargs) =>
        yargs
            .option("org", {
                type: "string",
                description: "Organization to generate token for (defaults to organization in fern.yml)"
            })
            .example("$0 auth token", "Generate token for workspace organization")
            .example("$0 auth token --org acme", "Generate token for specific organization")
            .example("export FERN_TOKEN=$($0 auth token)", "Export token to variable")
    );
}

async function handleToken(context: Context, args: TokenArgs): Promise<void> {
    const orgId = await resolveOrganization({ context, args });

    const token = await context.getTokenOrPrompt();
    if (token.type === "user") {
        // If we have a user token, create the organization if it doesn't already exist.
        await createOrganizationIfDoesNotExist({
            organization: orgId,
            token,
            context: new TaskContextAdapter({ context })
        });
    }

    const venus = createVenusService({ token: token.value });
    const response = await venus.registry.generateRegistryTokens({
        organizationId: FernVenusApi.OrganizationId(orgId)
    });
    if (response.ok) {
        // Output raw token (no newline for piping compatibility).
        process.stdout.write(response.body.npm.token);
        return;
    }

    response.error._visit({
        organizationNotFoundError: () => {
            process.stderr.write(`${Icons.error} Organization "${orgId}" was not found.\n`);
            throw CliError.exit();
        },
        unauthorizedError: () => {
            process.stderr.write(`${Icons.error} You do not have access to organization "${orgId}".\n`);
            throw CliError.exit();
        },
        _other: () => {
            process.stderr.write(
                `${Icons.error} Failed to generate token.\n` +
                    `\n  Please contact support@buildwithfern.com for assistance.\n`
            );
            throw CliError.exit();
        }
    });
}

async function resolveOrganization({ context, args }: { context: Context; args: TokenArgs }): Promise<string> {
    if (args.org != null) {
        return args.org;
    }
    try {
        const workspace = await context.loadWorkspaceOrThrow();
        return workspace.org;
    } catch {
        process.stderr.write(
            `${Icons.error} No organization specified.\n` +
                `\n  Run fern init or specify an organization with --org, then run this command again.\n`
        );
        throw CliError.exit();
    }
}
