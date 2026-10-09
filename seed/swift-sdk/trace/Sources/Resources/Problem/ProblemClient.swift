import Foundation

public final class ProblemClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Creates a problem
    ///
    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.problem.createProblem(request: CreateProblemRequest(
    ///         problemName: "problemName",
    ///         problemDescription: ProblemDescription(
    ///             boards: [
    ///                 ProblemDescriptionBoard.html(
    ///                     "boards"
    ///                 ),
    ///                 ProblemDescriptionBoard.html(
    ///                     "boards"
    ///                 )
    ///             ]
    ///         ),
    ///         files: [
    ///             .java: ProblemFiles(
    ///                 solutionFile: FileInfo(
    ///                     filename: "filename",
    ///                     contents: "contents"
    ///                 ),
    ///                 readOnlyFiles: [
    ///                     FileInfo(
    ///                         filename: "filename",
    ///                         contents: "contents"
    ///                     ),
    ///                     FileInfo(
    ///                         filename: "filename",
    ///                         contents: "contents"
    ///                     )
    ///                 ]
    ///             )
    ///         ],
    ///         inputParams: [
    ///             VariableTypeAndName(
    ///                 variableType: VariableType.integerType,
    ///                 name: "name"
    ///             ),
    ///             VariableTypeAndName(
    ///                 variableType: VariableType.integerType,
    ///                 name: "name"
    ///             )
    ///         ],
    ///         outputType: VariableType.integerType,
    ///         testcases: [
    ///             TestCaseWithExpectedResult(
    ///                 testCase: TestCase(
    ///                     id: "id",
    ///                     params: [
    ///                         VariableValue.integerValue(
    ///                             1
    ///                         ),
    ///                         VariableValue.integerValue(
    ///                             1
    ///                         )
    ///                     ]
    ///                 ),
    ///                 expectedResult: VariableValue.integerValue(
    ///                     1
    ///                 )
    ///             ),
    ///             TestCaseWithExpectedResult(
    ///                 testCase: TestCase(
    ///                     id: "id",
    ///                     params: [
    ///                         VariableValue.integerValue(
    ///                             1
    ///                         ),
    ///                         VariableValue.integerValue(
    ///                             1
    ///                         )
    ///                     ]
    ///                 ),
    ///                 expectedResult: VariableValue.integerValue(
    ///                     1
    ///                 )
    ///             )
    ///         ],
    ///         methodName: "methodName"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createProblem(request: CreateProblemRequest, requestOptions: RequestOptions? = nil) async throws -> CreateProblemResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/problem-crud/create",
            body: request,
            requestOptions: requestOptions,
            responseType: CreateProblemResponse.self
        )
    }

    /// Updates a problem
    ///
    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.problem.updateProblem(
    ///         problemId: "problemId",
    ///         request: CreateProblemRequest(
    ///             problemName: "problemName",
    ///             problemDescription: ProblemDescription(
    ///                 boards: [
    ///                     ProblemDescriptionBoard.html(
    ///                         "boards"
    ///                     ),
    ///                     ProblemDescriptionBoard.html(
    ///                         "boards"
    ///                     )
    ///                 ]
    ///             ),
    ///             files: [
    ///                 .java: ProblemFiles(
    ///                     solutionFile: FileInfo(
    ///                         filename: "filename",
    ///                         contents: "contents"
    ///                     ),
    ///                     readOnlyFiles: [
    ///                         FileInfo(
    ///                             filename: "filename",
    ///                             contents: "contents"
    ///                         ),
    ///                         FileInfo(
    ///                             filename: "filename",
    ///                             contents: "contents"
    ///                         )
    ///                     ]
    ///                 )
    ///             ],
    ///             inputParams: [
    ///                 VariableTypeAndName(
    ///                     variableType: VariableType.integerType,
    ///                     name: "name"
    ///                 ),
    ///                 VariableTypeAndName(
    ///                     variableType: VariableType.integerType,
    ///                     name: "name"
    ///                 )
    ///             ],
    ///             outputType: VariableType.integerType,
    ///             testcases: [
    ///                 TestCaseWithExpectedResult(
    ///                     testCase: TestCase(
    ///                         id: "id",
    ///                         params: [
    ///                             VariableValue.integerValue(
    ///                                 1
    ///                             ),
    ///                             VariableValue.integerValue(
    ///                                 1
    ///                             )
    ///                         ]
    ///                     ),
    ///                     expectedResult: VariableValue.integerValue(
    ///                         1
    ///                     )
    ///                 ),
    ///                 TestCaseWithExpectedResult(
    ///                     testCase: TestCase(
    ///                         id: "id",
    ///                         params: [
    ///                             VariableValue.integerValue(
    ///                                 1
    ///                             ),
    ///                             VariableValue.integerValue(
    ///                                 1
    ///                             )
    ///                         ]
    ///                     ),
    ///                     expectedResult: VariableValue.integerValue(
    ///                         1
    ///                     )
    ///                 )
    ///             ],
    ///             methodName: "methodName"
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateProblem(problemId: String, request: CreateProblemRequest, requestOptions: RequestOptions? = nil) async throws -> UpdateProblemResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/problem-crud/update/\(problemId)",
            body: request,
            requestOptions: requestOptions,
            responseType: UpdateProblemResponse.self
        )
    }

    /// Soft deletes a problem
    ///
    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.problem.deleteProblem(problemId: "problemId")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func deleteProblem(problemId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/problem-crud/delete/\(problemId)",
            requestOptions: requestOptions
        )
    }

    /// Returns default starter files for problem
    ///
    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.problem.getDefaultStarterFiles(request: .init(
    ///         inputParams: [
    ///             VariableTypeAndName(
    ///                 variableType: VariableType.integerType,
    ///                 name: "name"
    ///             ),
    ///             VariableTypeAndName(
    ///                 variableType: VariableType.integerType,
    ///                 name: "name"
    ///             )
    ///         ],
    ///         outputType: VariableType.integerType,
    ///         methodName: "methodName"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getDefaultStarterFiles(request: Requests.GetDefaultStarterFilesRequest, requestOptions: RequestOptions? = nil) async throws -> GetDefaultStarterFilesResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/problem-crud/default-starter-files",
            body: request,
            requestOptions: requestOptions,
            responseType: GetDefaultStarterFilesResponse.self
        )
    }
}