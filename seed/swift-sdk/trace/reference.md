# Reference
## V2
<details><summary><code>client.v2.<a href="/Sources/Resources/V2/V2Client.swift">test</a>(requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.v2.test()
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">updateTestSubmissionStatus</a>(submissionId: String, request: TestSubmissionStatus, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.admin.updateTestSubmissionStatus(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        request: TestSubmissionStatus.stopped(
            .init(

            )
        )
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TestSubmissionStatus` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">sendTestSubmissionUpdate</a>(submissionId: String, request: TestSubmissionUpdate, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.admin.sendTestSubmissionUpdate(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        request: TestSubmissionUpdate(
            updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updateInfo: TestSubmissionUpdateInfo.running(
                .init(
                    running: 
                )
            )
        )
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TestSubmissionUpdate` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">updateWorkspaceSubmissionStatus</a>(submissionId: String, request: WorkspaceSubmissionStatus, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.admin.updateWorkspaceSubmissionStatus(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        request: WorkspaceSubmissionStatus.stopped(
            .init(

            )
        )
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `WorkspaceSubmissionStatus` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">sendWorkspaceSubmissionUpdate</a>(submissionId: String, request: WorkspaceSubmissionUpdate, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.admin.sendWorkspaceSubmissionUpdate(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        request: WorkspaceSubmissionUpdate(
            updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updateInfo: WorkspaceSubmissionUpdateInfo.running(
                .init(
                    running: 
                )
            )
        )
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `WorkspaceSubmissionUpdate` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">storeTracedTestCase</a>(submissionId: String, testCaseId: String, request: Requests.StoreTracedTestCaseRequest, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.admin.storeTracedTestCase(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        testCaseId: "testCaseId",
        request: .init(
            result: TestCaseResultWithStdout(
                result: TestCaseResult(
                    expectedResult: VariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    ),
                    actualResult: ActualResult.value(
                        .init(
                            value: VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            )
                        )
                    ),
                    passed: true
                ),
                stdout: "stdout"
            ),
            traceResponses: [
                TraceResponse(
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                    lineNumber: 1,
                    returnValue: DebugVariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    ),
                    expressionLocation: ExpressionLocation(
                        start: 1,
                        offset: 1
                    ),
                    stack: StackInformation(
                        numStackFrames: 1,
                        topStackFrame: StackFrame(
                            methodName: "methodName",
                            lineNumber: 1,
                            scopes: [
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                ),
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                )
                            ]
                        )
                    ),
                    stdout: "stdout"
                ),
                TraceResponse(
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                    lineNumber: 1,
                    returnValue: DebugVariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    ),
                    expressionLocation: ExpressionLocation(
                        start: 1,
                        offset: 1
                    ),
                    stack: StackInformation(
                        numStackFrames: 1,
                        topStackFrame: StackFrame(
                            methodName: "methodName",
                            lineNumber: 1,
                            scopes: [
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                ),
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                )
                            ]
                        )
                    ),
                    stdout: "stdout"
                )
            ]
        )
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.StoreTracedTestCaseRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">storeTracedTestCaseV2</a>(submissionId: String, testCaseId: String, request: [TraceResponseV2], requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.admin.storeTracedTestCaseV2(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        testCaseId: "testCaseId",
        request: [
            TraceResponseV2(
                submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                lineNumber: 1,
                file: TracedFile(
                    filename: "filename",
                    directory: "directory"
                ),
                returnValue: DebugVariableValue.integerValue(
                    .init(
                        integerValue: 
                    )
                ),
                expressionLocation: ExpressionLocation(
                    start: 1,
                    offset: 1
                ),
                stack: StackInformation(
                    numStackFrames: 1,
                    topStackFrame: StackFrame(
                        methodName: "methodName",
                        lineNumber: 1,
                        scopes: [
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.integerValue(
                                        .init(
                                            integerValue: 
                                        )
                                    )
                                ]
                            ),
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.integerValue(
                                        .init(
                                            integerValue: 
                                        )
                                    )
                                ]
                            )
                        ]
                    )
                ),
                stdout: "stdout"
            ),
            TraceResponseV2(
                submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                lineNumber: 1,
                file: TracedFile(
                    filename: "filename",
                    directory: "directory"
                ),
                returnValue: DebugVariableValue.integerValue(
                    .init(
                        integerValue: 
                    )
                ),
                expressionLocation: ExpressionLocation(
                    start: 1,
                    offset: 1
                ),
                stack: StackInformation(
                    numStackFrames: 1,
                    topStackFrame: StackFrame(
                        methodName: "methodName",
                        lineNumber: 1,
                        scopes: [
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.integerValue(
                                        .init(
                                            integerValue: 
                                        )
                                    )
                                ]
                            ),
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.integerValue(
                                        .init(
                                            integerValue: 
                                        )
                                    )
                                ]
                            )
                        ]
                    )
                ),
                stdout: "stdout"
            )
        ]
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `[TraceResponseV2]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">storeTracedWorkspace</a>(submissionId: String, request: Requests.StoreTracedWorkspaceRequest, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.admin.storeTracedWorkspace(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        request: .init(
            workspaceRunDetails: WorkspaceRunDetails(
                exceptionV2: ExceptionV2.generic(
                    .init(
                        exceptionType: "exceptionType",
                        exceptionMessage: "exceptionMessage",
                        exceptionStacktrace: "exceptionStacktrace"
                    )
                ),
                exception: ExceptionInfo(
                    exceptionType: "exceptionType",
                    exceptionMessage: "exceptionMessage",
                    exceptionStacktrace: "exceptionStacktrace"
                ),
                stdout: "stdout"
            ),
            traceResponses: [
                TraceResponse(
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                    lineNumber: 1,
                    returnValue: DebugVariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    ),
                    expressionLocation: ExpressionLocation(
                        start: 1,
                        offset: 1
                    ),
                    stack: StackInformation(
                        numStackFrames: 1,
                        topStackFrame: StackFrame(
                            methodName: "methodName",
                            lineNumber: 1,
                            scopes: [
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                ),
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                )
                            ]
                        )
                    ),
                    stdout: "stdout"
                ),
                TraceResponse(
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                    lineNumber: 1,
                    returnValue: DebugVariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    ),
                    expressionLocation: ExpressionLocation(
                        start: 1,
                        offset: 1
                    ),
                    stack: StackInformation(
                        numStackFrames: 1,
                        topStackFrame: StackFrame(
                            methodName: "methodName",
                            lineNumber: 1,
                            scopes: [
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                ),
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                )
                            ]
                        )
                    ),
                    stdout: "stdout"
                )
            ]
        )
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.StoreTracedWorkspaceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">storeTracedWorkspaceV2</a>(submissionId: String, request: [TraceResponseV2], requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.admin.storeTracedWorkspaceV2(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        request: [
            TraceResponseV2(
                submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                lineNumber: 1,
                file: TracedFile(
                    filename: "filename",
                    directory: "directory"
                ),
                returnValue: DebugVariableValue.integerValue(
                    .init(
                        integerValue: 
                    )
                ),
                expressionLocation: ExpressionLocation(
                    start: 1,
                    offset: 1
                ),
                stack: StackInformation(
                    numStackFrames: 1,
                    topStackFrame: StackFrame(
                        methodName: "methodName",
                        lineNumber: 1,
                        scopes: [
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.integerValue(
                                        .init(
                                            integerValue: 
                                        )
                                    )
                                ]
                            ),
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.integerValue(
                                        .init(
                                            integerValue: 
                                        )
                                    )
                                ]
                            )
                        ]
                    )
                ),
                stdout: "stdout"
            ),
            TraceResponseV2(
                submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                lineNumber: 1,
                file: TracedFile(
                    filename: "filename",
                    directory: "directory"
                ),
                returnValue: DebugVariableValue.integerValue(
                    .init(
                        integerValue: 
                    )
                ),
                expressionLocation: ExpressionLocation(
                    start: 1,
                    offset: 1
                ),
                stack: StackInformation(
                    numStackFrames: 1,
                    topStackFrame: StackFrame(
                        methodName: "methodName",
                        lineNumber: 1,
                        scopes: [
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.integerValue(
                                        .init(
                                            integerValue: 
                                        )
                                    )
                                ]
                            ),
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.integerValue(
                                        .init(
                                            integerValue: 
                                        )
                                    )
                                ]
                            )
                        ]
                    )
                ),
                stdout: "stdout"
            )
        ]
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `[TraceResponseV2]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>client.homepage.<a href="/Sources/Resources/Homepage/HomepageClient.swift">getHomepageProblems</a>(requestOptions: RequestOptions?) -> [ProblemId]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.homepage.getHomepageProblems()
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.<a href="/Sources/Resources/Homepage/HomepageClient.swift">setHomepageProblems</a>(request: [ProblemId], requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.homepage.setHomepageProblems(request: [
        "string",
        "string"
    ])
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `[ProblemId]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.migration.<a href="/Sources/Resources/Migration/MigrationClient.swift">getAttemptedMigrations</a>(adminKeyHeader: String, requestOptions: RequestOptions?) -> [Migration]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.migration.getAttemptedMigrations()
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**adminKeyHeader:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">createPlaylist</a>(serviceParam: String, datetime: Date, optionalDatetime: Date?, request: PlaylistCreateRequest, requestOptions: RequestOptions?) -> Playlist</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new playlist
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.playlist.createPlaylist(
        serviceParam: 1,
        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        optionalDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        request: .init(body: PlaylistCreateRequest(
            name: "name",
            problems: [
                "problems",
                "problems"
            ]
        ))
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `Date` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDatetime:** `Date?` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `PlaylistCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">getPlaylists</a>(serviceParam: String, limit: Int?, otherField: String, multiLineDocs: String, optionalMultipleField: String?, multipleField: String, requestOptions: RequestOptions?) -> [Playlist]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns the user's playlists
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.playlist.getPlaylists(
        serviceParam: 1,
        limit: 1,
        otherField: "otherField",
        multiLineDocs: "multiLineDocs"
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Int?` 
    
</dd>
</dl>

<dl>
<dd>

**otherField:** `String` — i'm another field
    
</dd>
</dl>

<dl>
<dd>

**multiLineDocs:** `String` 

I'm a multiline
description
    
</dd>
</dl>

<dl>
<dd>

**optionalMultipleField:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**multipleField:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">getPlaylist</a>(serviceParam: String, playlistId: String, requestOptions: RequestOptions?) -> Playlist</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a playlist
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.playlist.getPlaylist(
        serviceParam: 1,
        playlistId: "playlistId"
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">updatePlaylist</a>(serviceParam: String, playlistId: String, request: UpdatePlaylistRequest?, requestOptions: RequestOptions?) -> Playlist?</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a playlist
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.playlist.updatePlaylist(
        serviceParam: 1,
        playlistId: "playlistId",
        request: UpdatePlaylistRequest(
            name: "name",
            problems: [
                "problems",
                "problems"
            ]
        )
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdatePlaylistRequest?` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">deletePlaylist</a>(serviceParam: String, playlistId: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a playlist
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.playlist.deletePlaylist(
        serviceParam: 1,
        playlistId: "playlist_id"
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.problem.<a href="/Sources/Resources/Problem/ProblemClient.swift">createProblem</a>(request: CreateProblemRequest, requestOptions: RequestOptions?) -> CreateProblemResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.problem.createProblem(request: CreateProblemRequest(
        problemName: "problemName",
        problemDescription: ProblemDescription(
            boards: [
                ProblemDescriptionBoard.html(
                    .init(
                        html: 
                    )
                ),
                ProblemDescriptionBoard.html(
                    .init(
                        html: 
                    )
                )
            ]
        ),
        files: [
            .java: ProblemFiles(
                solutionFile: FileInfo(
                    filename: "filename",
                    contents: "contents"
                ),
                readOnlyFiles: [
                    FileInfo(
                        filename: "filename",
                        contents: "contents"
                    ),
                    FileInfo(
                        filename: "filename",
                        contents: "contents"
                    )
                ]
            )
        ],
        inputParams: [
            VariableTypeAndName(
                variableType: VariableType.integerType(
                    .init(

                    )
                ),
                name: "name"
            ),
            VariableTypeAndName(
                variableType: VariableType.integerType(
                    .init(

                    )
                ),
                name: "name"
            )
        ],
        outputType: VariableType.integerType(
            .init(

            )
        ),
        testcases: [
            TestCaseWithExpectedResult(
                testCase: TestCase(
                    id: "id",
                    params: [
                        VariableValue.integerValue(
                            .init(
                                integerValue: 
                            )
                        ),
                        VariableValue.integerValue(
                            .init(
                                integerValue: 
                            )
                        )
                    ]
                ),
                expectedResult: VariableValue.integerValue(
                    .init(
                        integerValue: 
                    )
                )
            ),
            TestCaseWithExpectedResult(
                testCase: TestCase(
                    id: "id",
                    params: [
                        VariableValue.integerValue(
                            .init(
                                integerValue: 
                            )
                        ),
                        VariableValue.integerValue(
                            .init(
                                integerValue: 
                            )
                        )
                    ]
                ),
                expectedResult: VariableValue.integerValue(
                    .init(
                        integerValue: 
                    )
                )
            )
        ],
        methodName: "methodName"
    ))
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `CreateProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/Sources/Resources/Problem/ProblemClient.swift">updateProblem</a>(problemId: String, request: CreateProblemRequest, requestOptions: RequestOptions?) -> UpdateProblemResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.problem.updateProblem(
        problemId: "problemId",
        request: CreateProblemRequest(
            problemName: "problemName",
            problemDescription: ProblemDescription(
                boards: [
                    ProblemDescriptionBoard.html(
                        .init(
                            html: 
                        )
                    ),
                    ProblemDescriptionBoard.html(
                        .init(
                            html: 
                        )
                    )
                ]
            ),
            files: [
                .java: ProblemFiles(
                    solutionFile: FileInfo(
                        filename: "filename",
                        contents: "contents"
                    ),
                    readOnlyFiles: [
                        FileInfo(
                            filename: "filename",
                            contents: "contents"
                        ),
                        FileInfo(
                            filename: "filename",
                            contents: "contents"
                        )
                    ]
                )
            ],
            inputParams: [
                VariableTypeAndName(
                    variableType: VariableType.integerType(
                        .init(

                        )
                    ),
                    name: "name"
                ),
                VariableTypeAndName(
                    variableType: VariableType.integerType(
                        .init(

                        )
                    ),
                    name: "name"
                )
            ],
            outputType: VariableType.integerType(
                .init(

                )
            ),
            testcases: [
                TestCaseWithExpectedResult(
                    testCase: TestCase(
                        id: "id",
                        params: [
                            VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            ),
                            VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            )
                        ]
                    ),
                    expectedResult: VariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    )
                ),
                TestCaseWithExpectedResult(
                    testCase: TestCase(
                        id: "id",
                        params: [
                            VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            ),
                            VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            )
                        ]
                    ),
                    expectedResult: VariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    )
                )
            ],
            methodName: "methodName"
        )
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `CreateProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/Sources/Resources/Problem/ProblemClient.swift">deleteProblem</a>(problemId: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Soft deletes a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.problem.deleteProblem(problemId: "problemId")
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/Sources/Resources/Problem/ProblemClient.swift">getDefaultStarterFiles</a>(request: Requests.GetDefaultStarterFilesRequest, requestOptions: RequestOptions?) -> GetDefaultStarterFilesResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns default starter files for problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.problem.getDefaultStarterFiles(request: .init(
        inputParams: [
            VariableTypeAndName(
                variableType: VariableType.integerType(
                    .init(

                    )
                ),
                name: "name"
            ),
            VariableTypeAndName(
                variableType: VariableType.integerType(
                    .init(

                    )
                ),
                name: "name"
            )
        ],
        outputType: VariableType.integerType(
            .init(

            )
        ),
        methodName: "methodName"
    ))
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Requests.GetDefaultStarterFilesRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>client.submission.<a href="/Sources/Resources/Submission/SubmissionClient.swift">createExecutionSession</a>(language: String, requestOptions: RequestOptions?) -> ExecutionSessionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns sessionId and execution server URL for session. Spins up server.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.submission.createExecutionSession(language: .java)
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**language:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/Sources/Resources/Submission/SubmissionClient.swift">getExecutionSession</a>(sessionId: String, requestOptions: RequestOptions?) -> ExecutionSessionResponse?</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns execution server URL for session. Returns empty if session isn't registered.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.submission.getExecutionSession(sessionId: "sessionId")
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**sessionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/Sources/Resources/Submission/SubmissionClient.swift">stopExecutionSession</a>(sessionId: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Stops execution session.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.submission.stopExecutionSession(sessionId: "sessionId")
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**sessionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/Sources/Resources/Submission/SubmissionClient.swift">getExecutionSessionsState</a>(requestOptions: RequestOptions?) -> GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.submission.getExecutionSessionsState()
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>client.sysprop.<a href="/Sources/Resources/Sysprop/SyspropClient.swift">setNumWarmInstances</a>(language: String, numWarmInstances: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.sysprop.setNumWarmInstances(
        language: .java,
        numWarmInstances: 1
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**language:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**numWarmInstances:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.sysprop.<a href="/Sources/Resources/Sysprop/SyspropClient.swift">getNumWarmInstances</a>(requestOptions: RequestOptions?) -> [Language: Int]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.sysprop.getNumWarmInstances()
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 Problem
<details><summary><code>client.v2.problem.<a href="/Sources/Resources/V2/Problem/V2ProblemClient.swift">getLightweightProblems</a>(requestOptions: RequestOptions?) -> [LightweightProblemInfoV2]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns lightweight versions of all problems
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.v2.problem.getLightweightProblems()
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.problem.<a href="/Sources/Resources/V2/Problem/V2ProblemClient.swift">getProblems</a>(requestOptions: RequestOptions?) -> [ProblemInfoV2]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns latest versions of all problems
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.v2.problem.getProblems()
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.problem.<a href="/Sources/Resources/V2/Problem/V2ProblemClient.swift">getLatestProblem</a>(problemId: String, requestOptions: RequestOptions?) -> ProblemInfoV2</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns latest version of a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.v2.problem.getLatestProblem(problemId: "problemId")
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.problem.<a href="/Sources/Resources/V2/Problem/V2ProblemClient.swift">getProblemVersion</a>(problemId: String, problemVersion: String, requestOptions: RequestOptions?) -> ProblemInfoV2</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns requested version of a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.v2.problem.getProblemVersion(
        problemId: "problemId",
        problemVersion: 1
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 V3 Problem
<details><summary><code>client.v2.v3.problem.<a href="/Sources/Resources/V2/V3/Problem/V3ProblemClient.swift">getLightweightProblems</a>(requestOptions: RequestOptions?) -> [LightweightProblemInfoV2Type]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns lightweight versions of all problems
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.v2.problem.getLightweightProblems()
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.v3.problem.<a href="/Sources/Resources/V2/V3/Problem/V3ProblemClient.swift">getProblems</a>(requestOptions: RequestOptions?) -> [ProblemInfoV2Type]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns latest versions of all problems
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.v2.problem.getProblems()
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.v3.problem.<a href="/Sources/Resources/V2/V3/Problem/V3ProblemClient.swift">getLatestProblem</a>(problemId: String, requestOptions: RequestOptions?) -> ProblemInfoV2Type</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns latest version of a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.v2.problem.getLatestProblem(problemId: "problemId")
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.v3.problem.<a href="/Sources/Resources/V2/V3/Problem/V3ProblemClient.swift">getProblemVersion</a>(problemId: String, problemVersion: String, requestOptions: RequestOptions?) -> ProblemInfoV2Type</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns requested version of a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    _ = try await client.v2.problem.getProblemVersion(
        problemId: "problemId",
        problemVersion: 1
    )
}

try await main()
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

