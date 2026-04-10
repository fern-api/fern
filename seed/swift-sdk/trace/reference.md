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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

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
<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">updatetestsubmissionstatus</a>(submissionId: String, request: TestSubmissionStatus, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.admin.updatetestsubmissionstatus(
        submissionId: "submissionId",
        request: .init(body: TestSubmissionStatus.stopped(
            TestSubmissionStatusStopped(

            )
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

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">sendtestsubmissionupdate</a>(submissionId: String, request: TestSubmissionUpdate, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.admin.sendtestsubmissionupdate(
        submissionId: "submissionId",
        request: .init(body: TestSubmissionUpdate(
            updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updateInfo: TestSubmissionUpdateInfo.testSubmissionUpdateInfoZero(
                TestSubmissionUpdateInfoZero(
                    type: .running
                )
            )
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

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">updateworkspacesubmissionstatus</a>(submissionId: String, request: WorkspaceSubmissionStatus, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.admin.updateworkspacesubmissionstatus(
        submissionId: "submissionId",
        request: .init(body: WorkspaceSubmissionStatus.workspaceSubmissionStatusZero(
            WorkspaceSubmissionStatusZero(
                type: .stopped
            )
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

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">sendworkspacesubmissionupdate</a>(submissionId: String, request: WorkspaceSubmissionUpdate, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.admin.sendworkspacesubmissionupdate(
        submissionId: "submissionId",
        request: .init(body: WorkspaceSubmissionUpdate(
            updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updateInfo: WorkspaceSubmissionUpdateInfo.workspaceSubmissionUpdateInfoZero(
                WorkspaceSubmissionUpdateInfoZero(
                    type: .running
                )
            )
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

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">storetracedtestcase</a>(submissionId: String, testCaseId: String, request: Requests.AdminStoreTracedTestCaseRequest, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.admin.storetracedtestcase(
        submissionId: "submissionId",
        testCaseId: "testCaseId",
        request: .init(
            result: TestCaseResultWithStdout(
                result: TestCaseResult(
                    expectedResult: VariableValue.variableValueZero(
                        VariableValueZero(
                            type: .integerValue
                        )
                    ),
                    actualResult: ActualResult.actualResultZero(
                        ActualResultZero(
                            type: .value
                        )
                    ),
                    passed: true
                ),
                stdout: "stdout"
            ),
            traceResponses: [
                TraceResponse(
                    submissionId: "submissionId",
                    lineNumber: 1,
                    stack: StackInformation(
                        numStackFrames: 1
                    )
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

**request:** `Requests.AdminStoreTracedTestCaseRequest` 
    
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

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">storetracedtestcasev2</a>(submissionId: String, testCaseId: String, request: [TraceResponseV2], requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.admin.storetracedtestcasev2(
        submissionId: "submissionId",
        testCaseId: "testCaseId",
        request: .init(body: [
            TraceResponseV2(
                submissionId: "submissionId",
                lineNumber: 1,
                file: TracedFile(
                    filename: "filename",
                    directory: "directory"
                ),
                stack: StackInformation(
                    numStackFrames: 1
                )
            )
        ])
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

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">storetracedworkspace</a>(submissionId: String, request: Requests.AdminStoreTracedWorkspaceRequest, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.admin.storetracedworkspace(
        submissionId: "submissionId",
        request: .init(
            workspaceRunDetails: WorkspaceRunDetails(
                stdout: "stdout"
            ),
            traceResponses: [
                TraceResponse(
                    submissionId: "submissionId",
                    lineNumber: 1,
                    stack: StackInformation(
                        numStackFrames: 1
                    )
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

**request:** `Requests.AdminStoreTracedWorkspaceRequest` 
    
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

<details><summary><code>client.admin.<a href="/Sources/Resources/Admin/AdminClient.swift">storetracedworkspacev2</a>(submissionId: String, request: [TraceResponseV2], requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.admin.storetracedworkspacev2(
        submissionId: "submissionId",
        request: .init(body: [
            TraceResponseV2(
                submissionId: "submissionId",
                lineNumber: 1,
                file: TracedFile(
                    filename: "filename",
                    directory: "directory"
                ),
                stack: StackInformation(
                    numStackFrames: 1
                )
            )
        ])
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
<details><summary><code>client.homepage.<a href="/Sources/Resources/Homepage/HomepageClient.swift">gethomepageproblems</a>(requestOptions: RequestOptions?) -> [ProblemId]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.homepage.gethomepageproblems()
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

<details><summary><code>client.homepage.<a href="/Sources/Resources/Homepage/HomepageClient.swift">sethomepageproblems</a>(request: [ProblemId], requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.homepage.sethomepageproblems(request: [
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
<details><summary><code>client.migration.<a href="/Sources/Resources/Migration/MigrationClient.swift">getattemptedmigrations</a>(adminKeyHeader: String, requestOptions: RequestOptions?) -> [Migration]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.migration.getattemptedmigrations()
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
<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">createplaylist</a>(serviceParam: String, datetime: Date, optionalDatetime: Nullable&lt;Date&gt;?, request: PlaylistCreateRequest, requestOptions: RequestOptions?) -> Playlist</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.playlist.createplaylist(
        serviceParam: 1,
        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        request: .init(body: PlaylistCreateRequest(
            name: "name",
            problems: [
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

**optionalDatetime:** `Nullable<Date>?` 
    
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

<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">getplaylists</a>(serviceParam: String, limit: Nullable&lt;Int&gt;?, otherField: String, multiLineDocs: String, optionalMultipleField: Nullable&lt;String&gt;?, multipleField: String?, requestOptions: RequestOptions?) -> [Playlist]</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.playlist.getplaylists(
        serviceParam: 1,
        limit: .value(1),
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

**limit:** `Nullable<Int>?` 
    
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

**optionalMultipleField:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**multipleField:** `String?` 
    
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

<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">getplaylist</a>(serviceParam: String, playlistId: String, requestOptions: RequestOptions?) -> Playlist</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.playlist.getplaylist(
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

<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">updateplaylist</a>(serviceParam: String, playlistId: String, request: Requests.UpdatePlaylistRequest, requestOptions: RequestOptions?) -> Playlist</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.playlist.updateplaylist(
        serviceParam: 1,
        playlistId: "playlistId",
        request: .init(
            name: "name",
            problems: [
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

**request:** `Requests.UpdatePlaylistRequest` 
    
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

<details><summary><code>client.playlist.<a href="/Sources/Resources/Playlist/PlaylistClient.swift">deleteplaylist</a>(serviceParam: String, playlistId: String, requestOptions: RequestOptions?) -> Void</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.playlist.deleteplaylist(
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
<details><summary><code>client.problem.<a href="/Sources/Resources/Problem/ProblemClient.swift">createproblem</a>(request: CreateProblemRequest, requestOptions: RequestOptions?) -> CreateProblemResponse</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.problem.createproblem(request: CreateProblemRequest(
        problemName: "problemName",
        problemDescription: ProblemDescription(
            boards: [
                ProblemDescriptionBoard.html(
                    ProblemDescriptionBoardHtml(

                    )
                )
            ]
        ),
        files: [
            "key": ProblemFiles(
                solutionFile: FileInfo(
                    filename: "filename",
                    contents: "contents"
                ),
                readOnlyFiles: [
                    FileInfo(
                        filename: "filename",
                        contents: "contents"
                    )
                ]
            )
        ],
        inputParams: [
            VariableTypeAndName(
                variableType: VariableType.variableTypeZero(
                    VariableTypeZero(
                        type: .integerType
                    )
                ),
                name: "name"
            )
        ],
        outputType: VariableType.variableTypeZero(
            VariableTypeZero(
                type: .integerType
            )
        ),
        testcases: [
            TestCaseWithExpectedResult(
                testCase: TestCase(
                    id: "id",
                    params: [
                        VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue
                            )
                        )
                    ]
                ),
                expectedResult: VariableValue.variableValueZero(
                    VariableValueZero(
                        type: .integerValue
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

<details><summary><code>client.problem.<a href="/Sources/Resources/Problem/ProblemClient.swift">updateproblem</a>(problemId: String, request: CreateProblemRequest, requestOptions: RequestOptions?) -> UpdateProblemResponse</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.problem.updateproblem(
        problemId: "problemId",
        request: .init(body: CreateProblemRequest(
            problemName: "problemName",
            problemDescription: ProblemDescription(
                boards: [
                    ProblemDescriptionBoard.html(
                        ProblemDescriptionBoardHtml(

                        )
                    )
                ]
            ),
            files: [
                "key": ProblemFiles(
                    solutionFile: FileInfo(
                        filename: "filename",
                        contents: "contents"
                    ),
                    readOnlyFiles: [
                        FileInfo(
                            filename: "filename",
                            contents: "contents"
                        )
                    ]
                )
            ],
            inputParams: [
                VariableTypeAndName(
                    variableType: VariableType.variableTypeZero(
                        VariableTypeZero(
                            type: .integerType
                        )
                    ),
                    name: "name"
                )
            ],
            outputType: VariableType.variableTypeZero(
                VariableTypeZero(
                    type: .integerType
                )
            ),
            testcases: [
                TestCaseWithExpectedResult(
                    testCase: TestCase(
                        id: "id",
                        params: [
                            VariableValue.variableValueZero(
                                VariableValueZero(
                                    type: .integerValue
                                )
                            )
                        ]
                    ),
                    expectedResult: VariableValue.variableValueZero(
                        VariableValueZero(
                            type: .integerValue
                        )
                    )
                )
            ],
            methodName: "methodName"
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

<details><summary><code>client.problem.<a href="/Sources/Resources/Problem/ProblemClient.swift">deleteproblem</a>(problemId: String, requestOptions: RequestOptions?) -> Void</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.problem.deleteproblem(problemId: "problemId")
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

<details><summary><code>client.problem.<a href="/Sources/Resources/Problem/ProblemClient.swift">getdefaultstarterfiles</a>(request: Requests.ProblemGetDefaultStarterFilesRequest, requestOptions: RequestOptions?) -> GetDefaultStarterFilesResponse</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.problem.getdefaultstarterfiles(request: .init(
        inputParams: [
            VariableTypeAndName(
                variableType: VariableType.variableTypeZero(
                    VariableTypeZero(
                        type: .integerType
                    )
                ),
                name: "name"
            )
        ],
        outputType: VariableType.variableTypeZero(
            VariableTypeZero(
                type: .integerType
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

**request:** `Requests.ProblemGetDefaultStarterFilesRequest` 
    
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
<details><summary><code>client.submission.<a href="/Sources/Resources/Submission/SubmissionClient.swift">createexecutionsession</a>(language: String, requestOptions: RequestOptions?) -> ExecutionSessionResponse</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.submission.createexecutionsession(language: .java)
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

<details><summary><code>client.submission.<a href="/Sources/Resources/Submission/SubmissionClient.swift">getexecutionsession</a>(sessionId: String, requestOptions: RequestOptions?) -> ExecutionSessionResponse</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.submission.getexecutionsession(sessionId: "sessionId")
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

<details><summary><code>client.submission.<a href="/Sources/Resources/Submission/SubmissionClient.swift">stopexecutionsession</a>(sessionId: String, requestOptions: RequestOptions?) -> Void</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.submission.stopexecutionsession(sessionId: "sessionId")
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

<details><summary><code>client.submission.<a href="/Sources/Resources/Submission/SubmissionClient.swift">getexecutionsessionsstate</a>(requestOptions: RequestOptions?) -> GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.submission.getexecutionsessionsstate()
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
<details><summary><code>client.sysprop.<a href="/Sources/Resources/Sysprop/SyspropClient.swift">setnumwarminstances</a>(language: String, numWarmInstances: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.sysprop.setnumwarminstances(
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

<details><summary><code>client.sysprop.<a href="/Sources/Resources/Sysprop/SyspropClient.swift">getnumwarminstances</a>(requestOptions: RequestOptions?) -> [String: Int]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.sysprop.getnumwarminstances()
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

## V2Problem
<details><summary><code>client.v2Problem.<a href="/Sources/Resources/V2Problem/V2ProblemClient.swift">v2ProblemGetLightweightProblems</a>(requestOptions: RequestOptions?) -> [V2LightweightProblemInfoV2]</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.v2Problem.v2ProblemGetLightweightProblems()
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

<details><summary><code>client.v2Problem.<a href="/Sources/Resources/V2Problem/V2ProblemClient.swift">v2ProblemGetProblems</a>(requestOptions: RequestOptions?) -> [V2ProblemInfoV2]</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.v2Problem.v2ProblemGetProblems()
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

<details><summary><code>client.v2Problem.<a href="/Sources/Resources/V2Problem/V2ProblemClient.swift">v2ProblemGetLatestProblem</a>(problemId: String, requestOptions: RequestOptions?) -> V2ProblemInfoV2</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.v2Problem.v2ProblemGetLatestProblem(problemId: "problemId")
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

<details><summary><code>client.v2Problem.<a href="/Sources/Resources/V2Problem/V2ProblemClient.swift">v2ProblemGetProblemVersion</a>(problemId: String, problemVersion: String, requestOptions: RequestOptions?) -> V2ProblemInfoV2</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.v2Problem.v2ProblemGetProblemVersion(
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

## V2V3Problem
<details><summary><code>client.v2V3Problem.<a href="/Sources/Resources/V2V3Problem/V2V3ProblemClient.swift">v2V3ProblemGetLightweightProblems</a>(requestOptions: RequestOptions?) -> [V2V3LightweightProblemInfoV2]</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.v2V3Problem.v2V3ProblemGetLightweightProblems()
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

<details><summary><code>client.v2V3Problem.<a href="/Sources/Resources/V2V3Problem/V2V3ProblemClient.swift">v2V3ProblemGetProblems</a>(requestOptions: RequestOptions?) -> [V2V3ProblemInfoV2]</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.v2V3Problem.v2V3ProblemGetProblems()
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

<details><summary><code>client.v2V3Problem.<a href="/Sources/Resources/V2V3Problem/V2V3ProblemClient.swift">v2V3ProblemGetLatestProblem</a>(problemId: String, requestOptions: RequestOptions?) -> V2V3ProblemInfoV2</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.v2V3Problem.v2V3ProblemGetLatestProblem(problemId: "problemId")
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

<details><summary><code>client.v2V3Problem.<a href="/Sources/Resources/V2V3Problem/V2V3ProblemClient.swift">v2V3ProblemGetProblemVersion</a>(problemId: String, problemVersion: String, requestOptions: RequestOptions?) -> V2V3ProblemInfoV2</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.v2V3Problem.v2V3ProblemGetProblemVersion(
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

