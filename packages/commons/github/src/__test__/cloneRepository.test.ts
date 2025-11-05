import { cloneRepository } from "../cloneRepository";

describe("cloneRepository", () => {
    it("fern-api/docs-starter-openapi", async () => {
        const repository = await cloneRepository({
            githubRepository: "github.com/fern-api/docs-starter-openapi",
            installationToken: undefined
        });
        const readme = await repository.getReadme();
        expect(readme).contains("Fern");
    }, 10000);
    it("invalid installation token", async () => {
        await expect(async () => {
            await cloneRepository({
                githubRepository: "https://github.com/fern-api/github-app-test",
                installationToken: "ghp_xyz"
            });
        }).rejects.toThrow();
    }, 10000);
    it("repository does not exist", async () => {
        await expect(async () => {
            await cloneRepository({
                githubRepository: "https://github.com/fern-api/does-not-exist",
                installationToken: undefined
            });
        }).rejects.toThrow();
    }, 10000);
});
