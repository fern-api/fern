import path from "path";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ProtobufFileInfo, ProtobufParser } from "../ProtobufParser";

const TEST_DEFINITIONS = AbsoluteFilePath.of(path.join(__dirname, "protobuf/test-definitions"));

interface TestCase {
    filename: string;
    expected: ProtobufFileInfo;
}

describe("protobuf parser", () => {
    const parser = new ProtobufParser();

    const testCases: TestCase[] = [
        {
            filename: "empty.proto",
            expected: {
                csharpNamespace: undefined,
                packageName: undefined,
                serviceName: undefined
            }
        },
        {
            filename: "exhaustive.proto",
            expected: {
                csharpNamespace: "User.V1",
                packageName: "user.v1",
                serviceName: "User"
            }
        },
        {
            filename: "option.proto",
            expected: {
                csharpNamespace: "User.V1",
                packageName: undefined,
                serviceName: undefined
            }
        },
        {
            filename: "package.proto",
            expected: {
                csharpNamespace: undefined,
                packageName: "user.v1",
                serviceName: undefined
            }
        },
        {
            filename: "service.proto",
            expected: {
                csharpNamespace: undefined,
                packageName: undefined,
                serviceName: "User"
            }
        }
    ];

    testCases.forEach((testCase) => {
        it(`"${testCase.filename}"`, async () => {
            const actual = parser.parse({
                absoluteFilePath: join(TEST_DEFINITIONS, RelativeFilePath.of(testCase.filename))
            });
            expect(actual).toEqual(testCase.expected);
        });
    });
});
