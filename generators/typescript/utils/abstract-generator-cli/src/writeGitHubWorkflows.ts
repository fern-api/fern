import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function writeGitHubWorkflows({
    config,
    githubOutputMode,
    isPackagePrivate,
    pathToProject,
    publishToJsr,
    packageManager
}: {
    config: FernGeneratorExec.GeneratorConfig;
    githubOutputMode: FernGeneratorExec.GithubOutputMode;
    isPackagePrivate: boolean;
    pathToProject: AbsoluteFilePath;
    publishToJsr: boolean;
    packageManager: "pnpm" | "yarn";
}): Promise<void> {
    if (githubOutputMode.publishInfo != null && githubOutputMode.publishInfo.type !== "npm") {
        throw new Error(
            `Expected to receive npm publish info but received ${githubOutputMode.publishInfo.type} instead`
        );
    }
    const workflowYaml = constructWorkflowYaml({
        publishInfo: githubOutputMode.publishInfo,
        isPackagePrivate,
        config,
        publishToJsr,
        packageManager
    });
    const githubWorkflowsDir = path.join(pathToProject, ".github", "workflows");
    await mkdir(githubWorkflowsDir, { recursive: true });
    await writeFile(`${githubWorkflowsDir}/ci.yml`, workflowYaml);
}

function constructWorkflowYaml({
    config,
    publishInfo,
    isPackagePrivate,
    publishToJsr,
    packageManager
}: {
    config: FernGeneratorExec.GeneratorConfig;
    publishInfo: FernGeneratorExec.NpmGithubPublishInfo | undefined;
    isPackagePrivate: boolean;
    publishToJsr: boolean;
    packageManager: "pnpm" | "yarn";
}) {
    const usePnpm = packageManager === "pnpm";
    let workflowYaml = `name: ci

on: [push]

jobs:
  compile:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up node
        uses: actions/setup-node@v4${
            usePnpm
                ? `

      - name: Install pnpm
        uses: pnpm/action-setup@v4`
                : ""
        }

      - name: Install dependencies
        run: ${packageManager} install

      - name: Compile
        run: ${packageManager} build

  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up node
        uses: actions/setup-node@v4${
            usePnpm
                ? `
                
      - name: Install pnpm
        uses: pnpm/action-setup@v4`
                : ""
        }

      - name: Install dependencies
        run: ${packageManager} install

      - name: Test
        run: ${packageManager} test
`;

    // First condition is for resilience in the event that Fiddle isn't upgraded to include the new flag
    if (
        (publishInfo != null && publishInfo?.shouldGeneratePublishWorkflow == null) ||
        publishInfo?.shouldGeneratePublishWorkflow === true
    ) {
        const access = isPackagePrivate ? "restricted" : "public";
        const secretsVarName = publishInfo.tokenEnvironmentVariable?.toString() || "NPM_TOKEN";
        const useOidc = secretsVarName === "<USE_OIDC>";

        workflowYaml += `
  publish:
    needs: [ compile, test ]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest${
        useOidc
            ? `
    permissions:
      contents: read   # Required for checkout
      id-token: write  # Required for OIDC`
            : ""
    }
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up node
        uses: actions/setup-node@v4${
            usePnpm
                ? `

      - name: Install pnpm
        uses: pnpm/action-setup@v4`
                : ""
        }

      - name: Install dependencies
        run: ${packageManager} install

      - name: Build
        run: ${packageManager} build

      - name: Publish to npm
        run: |${
            useOidc
                ? ""
                : `
          npm config set //registry.npmjs.org/:_authToken \${NPM_TOKEN}`
        }
          publish() {  # use latest npm to ensure OIDC support
            npx -y npm@latest publish "$@"
          }
          if [[ \${GITHUB_REF} == *alpha* ]]; then
            publish --access ${access} --tag alpha
          elif [[ \${GITHUB_REF} == *beta* ]]; then
            publish --access ${access} --tag beta
          else
            publish --access ${access}
          fi${
              useOidc
                  ? ""
                  : `
        env:
          NPM_TOKEN: \${{ secrets.${secretsVarName} }}`
          }`;
    }

    if (publishToJsr) {
        workflowYaml += `

  publish-jsr:
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    needs: [ compile, test ]
    permissions:
      contents: read
      id-token: write # The OIDC ID token is used for authentication with JSR. 
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
      
      - name: Set up node
        uses: actions/setup-node@v4${
            usePnpm
                ? `

      - name: Install pnpm
        uses: pnpm/action-setup@v4`
                : ""
        }
      
      - name: Install dependencies
        run: ${packageManager} install
      
      - name: Build
        run: ${packageManager} build

      - name: Publish to JSR
        run: npx jsr publish`;
    }

    return workflowYaml;
}
