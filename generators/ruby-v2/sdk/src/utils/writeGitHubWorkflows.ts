import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { PublishingConfig } from "@fern-fern/ir-sdk/api";

export interface WriteGitHubWorkflowsArgs {
    githubOutputMode: FernGeneratorExec.GithubOutputMode;
    publishConfig: PublishingConfig | undefined;
}

export function generateGitHubWorkflowFiles(args: WriteGitHubWorkflowsArgs): File[] {
    const files: File[] = [];

    const workflowContent = constructWorkflowYaml(args);
    files.push(new File("ci.yml", RelativeFilePath.of(".github/workflows"), workflowContent));

    files.push(new File(".gitignore", RelativeFilePath.of("."), constructGitignore()));

    return files;
}

function constructWorkflowYaml({ githubOutputMode, publishConfig }: WriteGitHubWorkflowsArgs): string {
    let workflowYaml = `name: ci

on: [push]

jobs:
  compile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.2"
          bundler-cache: true

      - name: Install dependencies
        run: bundle install

      - name: Lint with RuboCop
        run: bundle exec rubocop

  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.2"
          bundler-cache: true

      - name: Install dependencies
        run: bundle install

      - name: Run tests
        run: bundle exec rake test
`;

    const publishInfo = githubOutputMode.publishInfo;
    if (publishInfo != null && publishInfo.type === "rubygems") {
        const shouldGeneratePublishWorkflow =
            publishInfo.shouldGeneratePublishWorkflow == null || publishInfo.shouldGeneratePublishWorkflow === true;

        if (shouldGeneratePublishWorkflow) {
            const apiKeyEnvVar = publishInfo.apiKeyEnvironmentVariable ?? "RUBYGEMS_API_KEY";

            workflowYaml += `
  publish:
    needs: [compile, test]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.2"
          bundler-cache: true

      - name: Install dependencies
        run: bundle install

      - name: Build gem
        run: gem build *.gemspec

      - name: Publish to RubyGems
        run: |
          mkdir -p ~/.gem
          echo "---" > ~/.gem/credentials
          echo ":rubygems_api_key: \${GEM_HOST_API_KEY}" >> ~/.gem/credentials
          chmod 0600 ~/.gem/credentials
          gem push *.gem
        env:
          GEM_HOST_API_KEY: \${{ secrets.${apiKeyEnvVar} }}
`;
        }
    }

    return workflowYaml;
}

function constructGitignore(): string {
    return `# Bundler
/.bundle/
/vendor/bundle/

# Gem build artifacts
*.gem
/pkg/

# RSpec
/coverage/
/spec/reports/

# RuboCop
/.rubocop-*

# IDE
/.idea/
/.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
`;
}
