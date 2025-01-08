import path from "path";

import { AbstractGeneratorContext } from "@fern-api/browser-compatible-base-generator";
import { AbsoluteFilePath, getDirectoryContents, getDirectoryContentsForSnapshot } from "@fern-api/fs-utils";

import { SourceFetcher } from "../SourceFetcher";

const AWS_BUCKET_NAME = "fdr-api-definition-source-test";
const AWS_OBJECT_KEY = "fern/fern/2024-08-11T22:35:49.980Z/f6ea473b-1884-4ccc-b386-113cbff139d1";

const FIXTURES = AbsoluteFilePath.of(path.join(__dirname, "fixtures"));

class DummyAbstractGeneratorContext extends AbstractGeneratorContext {}

it("fetch proto.zip", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context = new DummyAbstractGeneratorContext(undefined as any, undefined as any);
    const sourceFetcher = new SourceFetcher({
        context,
        sourceConfig: {
            sources: [
                {
                    type: "proto",
                    protoRootUrl: `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${AWS_OBJECT_KEY}`
                }
            ]
        }
    });
    const protobufFilepaths = await sourceFetcher.copyProtobufSources(FIXTURES);
    expect(protobufFilepaths).toEqual([
        "google/api/annotations.proto",
        "google/api/field_behavior.proto",
        "google/api/http.proto",
        "user/v1/user.proto"
    ]);
    expect(await getDirectoryContentsForSnapshot(FIXTURES)).toMatchSnapshot();
}, 100_000);
