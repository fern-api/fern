import { TaskContext } from "@fern-api/task-context";
import { App, Octokit } from "octokit";

// Taken from my fern-bot work
export function setupGithubApp(): App {
    const app = new App({
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
        oauth: {
            clientId: process.env.GITHUB_APP_CLIENT_ID!,
            clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!
        }
    });

    return app;
}

export async function createGithubRepo({
    context,
    app,
    orgName,
    repoName,
    usersToInvite,
    description
}: {
    context: TaskContext;
    app: App;
    orgName: string;
    repoName: string;
    usersToInvite?: string[];
    description?: string;
}): Promise<string> {
    const octokit = await app.getInstallationOctokit(56013476);

    context.logger.enable();
    context.logger.info(`Creating repository ${repoName} in organization ${orgName}`);
    context.logger.disable();
    const response = await octokit.rest.repos.createInOrg({
        org: orgName,
        name: repoName,
        description,
        visibility: "private"
    });

    for (const user of usersToInvite ?? []) {
        await inviteCollaboratorToRepo(octokit, orgName, repoName, user);
    }

    return response.data.html_url;
}

export async function inviteCollaboratorToRepo(
    octokit: Octokit,
    orgName: string,
    repoName: string,
    username: string
): Promise<void> {
    await octokit.rest.repos.addCollaborator({
        owner: orgName,
        repo: repoName,
        username: username,
        permission: "pull" // This is effectively read-only permissions
    });
}
