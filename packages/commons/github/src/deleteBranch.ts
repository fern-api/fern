import type { SimpleGit } from "simple-git";

import { DEFAULT_REMOTE_NAME } from "./constants";

export async function deleteBranch(git: SimpleGit, branchToDeleteName: string): Promise<void> {
    await git.fetch(DEFAULT_REMOTE_NAME, branchToDeleteName);
    const deleteResult = await git.branch(["-D", branchToDeleteName]);
    // For some reason the API is not typed to return this, but the documentation
    // says that it can return a BranchSingleDeleteResult, which is an interface, so we
    // cannot do an instance check:
    // https://www.npmjs.com/package/simple-git#git-branch
    if ("success" in deleteResult) {
        console.log(`Deleted branch ${branchToDeleteName}`);
        if (deleteResult.success !== true) {
            throw new Error("Failed to delete branch, received a failure response: " + JSON.stringify(deleteResult));
        }
    } else {
        throw new Error("Failed to delete branch, received an unexpected response: " + JSON.stringify(deleteResult));
    }
}
