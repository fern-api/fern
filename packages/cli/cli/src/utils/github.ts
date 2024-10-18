import { InteractiveTaskContext, TaskContext } from "@fern-api/task-context";
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
    context?: InteractiveTaskContext;
    app: App;
    orgName: string;
    repoName: string;
    usersToInvite?: string[];
    description?: string;
}): Promise<string> {
    const octokit = await app.getInstallationOctokit(56013476);

    context?.setSubtitle(`Creating repository ${repoName} in organization ${orgName}`);
    const response = await octokit.rest.repos.createInOrg({
        org: orgName,
        name: repoName,
        description,
        visibility: "private"
    });

    context?.setSubtitle(`Inviting you to ${orgName}/${repoName}`);
    for (const user of usersToInvite ?? []) {
        await inviteCollaboratorToRepo(octokit, orgName, repoName, user);
    }
    context?.setSubtitle(`Invited you to collaborate on ${orgName}/${repoName}`);

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
