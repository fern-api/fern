import type { SimpleGit } from "simple-git";

import { DEFAULT_REMOTE_NAME } from "./constants";

export async function getOrUpdateBranch(
    git: SimpleGit,
    defaultBranchName: string,
    branchToCheckoutName: string
): Promise<void> {
    try {
        // If you can fetch the branch, checkout the branch
        await git.fetch(DEFAULT_REMOTE_NAME, branchToCheckoutName);
        console.log(`Branch (${branchToCheckoutName}) exists, checking out`);
        await git.checkout(branchToCheckoutName);
        // Merge the default branch into this branch to update it
        // prefer the default branch changes
        //
        // TODO: we could honestly probably just delete the branch and recreate it
        // my concern with that is if there are more changes we decide to make in other actions
        // to the same branch that are not OpenAPI related, that we'd lose if we deleted and reupdated the spec.
        await git.merge(["-X", "theirs", defaultBranchName]);
    } catch (e) {
        console.log(`Branch (${branchToCheckoutName}) does not exist, create and checkout`, e);
        await git.checkoutBranch(branchToCheckoutName, defaultBranchName);
    }
}
