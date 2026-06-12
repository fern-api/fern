import type { Audiences } from "@fern-api/configuration";
import {
  APIV1Db,
  convertAPIDefinitionToDb,
  convertDbAPIDefinitionToRead,
  SDKSnippetHolder,
} from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getOriginalName } from "@fern-api/ir-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { convertIrToFdrApi } from "@fern-api/register";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURES_DIR = join(
  AbsoluteFilePath.of(__dirname),
  RelativeFilePath.of("fixtures"),
);
const FIXTURE_NAME = "v3-list-ref-discriminated-union-audiences";

async function getIRForFixture(audiences: Audiences) {
  const fixturePath = join(
    FIXTURES_DIR,
    RelativeFilePath.of(FIXTURE_NAME),
    RelativeFilePath.of("fern"),
  );
  const context = createMockTaskContext();
  const workspace = await loadAPIWorkspace({
    absolutePathToWorkspace: fixturePath,
    context,
    cliVersion: "0.0.0",
    workspaceName: FIXTURE_NAME,
  });
  if (!workspace.didSucceed) {
    throw new Error(
      `Failed to load OpenAPI fixture ${FIXTURE_NAME}\n${JSON.stringify(workspace.failures)}`,
    );
  }
  if (!(workspace.workspace instanceof OSSWorkspace)) {
    throw new Error(`Expected OSSWorkspace for fixture ${FIXTURE_NAME}`);
  }
  return workspace.workspace.getIntermediateRepresentation({
    context,
    audiences,
    enableUniqueErrorsPerEndpoint: false,
    generateV1Examples: true,
    logWarnings: false,
  });
}

type IR = Awaited<ReturnType<typeof getIRForFixture>>;

function typeOriginalNames(ir: IR): string[] {
  return Object.values(ir.types).map((t) => getOriginalName(t.name.name));
}

// Regression coverage for the audience-filter pruning bug: a discriminated union
// referenced ONLY through a named `list`-of-`$ref` alias (Messages -> list of
// ChatMessage) was dropped from the IR when an audience filter was active,
// because the array alias recorded an empty `referencedTypes` and the
// reachability graph never reached the union. The dangling reference then
// rendered as `list of any` in docs (e.g. Cohere's v2 chat `messages` field).
//
// The `chat` endpoint is tagged `["public"]`; the union and its variants carry
// NO `x-fern-audiences`, so they survive purely by being referenced from an
// in-audience endpoint through the array alias.
describe("OpenAPI 3.1 -> IR: list-of-$ref discriminated union under audience filtering", () => {
  it("keeps the union + variants without a filter (baseline)", async () => {
    const names = typeOriginalNames(await getIRForFixture({ type: "all" }));
    expect(names).toEqual(
      expect.arrayContaining([
        "Messages",
        "ChatMessage",
        "UserMessage",
        "AssistantMessage",
      ]),
    );
  }, 90_000);

  it("retains the union + variants reachable only via a list-of-$ref alias when filtering by [public]", async () => {
    const names = typeOriginalNames(
      await getIRForFixture({ type: "select", audiences: ["public"] }),
    );
    // Before the fix these were pruned (Messages.referencedTypes was empty),
    // leaving `Messages` pointing at a missing `ChatMessage`.
    expect(names).toContain("ChatMessage");
    expect(names).toContain("UserMessage");
    expect(names).toContain("AssistantMessage");
  }, 90_000);

  it("leaves no dangling type reference: full FDR read pipeline resolves the union under [public]", async () => {
    const ir = await getIRForFixture({ type: "select", audiences: ["public"] });
    const snippetHolder = new SDKSnippetHolder({
      snippetsBySdkId: {},
      snippetsConfigWithSdkId: {},
      snippetTemplatesByEndpoint: {},
      snippetsBySdkIdAndEndpointId: {},
      snippetTemplatesByEndpointId: {},
    });
    const context = createMockTaskContext();
    const fdrApi = convertIrToFdrApi({
      ir,
      snippetsConfig: {
        typescriptSdk: undefined,
        pythonSdk: undefined,
        javaSdk: undefined,
        rubySdk: undefined,
        goSdk: undefined,
        csharpSdk: undefined,
        phpSdk: undefined,
        swiftSdk: undefined,
        rustSdk: undefined,
      },
      context,
    });
    const dbDef = convertAPIDefinitionToDb(
      fdrApi,
      APIV1Db.ApiDefinitionId("test-api"),
      snippetHolder,
    );
    const readDef = convertDbAPIDefinitionToRead(dbDef);
    // The union type must be present (and therefore renderable as variants)
    // rather than collapsed to `unknown`/`any`.
    const readTypeNames = Object.values(readDef.types).map((t) => t.name);
    expect(readTypeNames).toContain("ChatMessage");
  }, 90_000);
});
