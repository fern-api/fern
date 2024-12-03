/* eslint-disable */

import { TestCase } from "./utils/TestCase";

it.skip("TODO: Remove this!", () => {});

// TODO: Uncomment this test after the dynamic IR dependency is updated.
//
// import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator";
// import { DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY } from "./utils/constant";
// import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
// import { TestCase } from "./utils/TestCase";
// import { AbsoluteFilePath } from "@fern-api/path-utils";
//
// describe("file-upload (success)", () => {
//     const testCases: TestCase[] = [
//         {
//             description: "POST /",
//             giveRequest: {
//                 endpoint: {
//                     method: "POST",
//                     path: "/"
//                 },
//                 auth: undefined,
//                 pathParameters: undefined,
//                 queryParameters: undefined,
//                 headers: undefined,
//                 requestBody: {
//                     file: "Hello, world!",
//                     fileList: ["First", "Second"]
//                 }
//             }
//         },
//         {
//             description: "POST /just-file (simple)",
//             giveRequest: {
//                 endpoint: {
//                     method: "POST",
//                     path: "/just-file"
//                 },
//                 auth: undefined,
//                 pathParameters: undefined,
//                 queryParameters: undefined,
//                 headers: undefined,
//                 requestBody: {
//                     file: "Hello, world!"
//                 }
//             }
//         },
//         {
//             description: "POST /just-file-with-query-params (simple)",
//             giveRequest: {
//                 endpoint: {
//                     method: "POST",
//                     path: "/just-file-with-query-params"
//                 },
//                 auth: undefined,
//                 pathParameters: undefined,
//                 queryParameters: {
//                     integer: 42,
//                     maybeString: "exists"
//                 },
//                 headers: undefined,
//                 requestBody: {
//                     file: "Hello, world!"
//                 }
//             }
//         }
//     ];
//     const generator = buildDynamicSnippetsGenerator({
//         irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/file-upload.json`),
//         config: buildGeneratorConfig()
//     });
//     test.each(testCases)("$description", async ({ giveRequest }) => {
//         const response = await generator.generate(giveRequest);
//         expect(response.snippet).toMatchSnapshot();

//         console.log(response.errors);
//         expect(response.errors).toBeUndefined();
//     });
// });
