# Reference
## V2
<details><summary><code>client.v2.test()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.v2().test();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>client.admin.updatetestsubmissionstatus(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().updatetestsubmissionstatus(
    "submissionId",
    AdminUpdateTestSubmissionStatusRequest
        .builder()
        .body(
            TestSubmissionStatus.stopped(
                TestSubmissionStatusStopped
                    .builder()
                    .build()
            )
        )
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.sendtestsubmissionupdate(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().sendtestsubmissionupdate(
    "submissionId",
    AdminSendTestSubmissionUpdateRequest
        .builder()
        .body(
            TestSubmissionUpdate
                .builder()
                .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .updateInfo(
                    TestSubmissionUpdateInfo.of(
                        TestSubmissionUpdateInfoZero
                            .builder()
                            .type(TestSubmissionUpdateInfoZeroType.RUNNING)
                            .build()
                    )
                )
                .build()
        )
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.updateworkspacesubmissionstatus(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().updateworkspacesubmissionstatus(
    "submissionId",
    AdminUpdateWorkspaceSubmissionStatusRequest
        .builder()
        .body(
            WorkspaceSubmissionStatus.of(
                WorkspaceSubmissionStatusZero
                    .builder()
                    .type(WorkspaceSubmissionStatusZeroType.STOPPED)
                    .build()
            )
        )
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.sendworkspacesubmissionupdate(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().sendworkspacesubmissionupdate(
    "submissionId",
    AdminSendWorkspaceSubmissionUpdateRequest
        .builder()
        .body(
            WorkspaceSubmissionUpdate
                .builder()
                .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .updateInfo(
                    WorkspaceSubmissionUpdateInfo.of(
                        WorkspaceSubmissionUpdateInfoZero
                            .builder()
                            .type(WorkspaceSubmissionUpdateInfoZeroType.RUNNING)
                            .build()
                    )
                )
                .build()
        )
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.storetracedtestcase(submissionId, testCaseId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().storetracedtestcase(
    "submissionId",
    "testCaseId",
    AdminStoreTracedTestCaseRequest
        .builder()
        .result(
            TestCaseResultWithStdout
                .builder()
                .result(
                    TestCaseResult
                        .builder()
                        .expectedResult(
                            VariableValue.of(
                                VariableValueZero
                                    .builder()
                                    .type(VariableValueZeroType.INTEGER_VALUE)
                                    .build()
                            )
                        )
                        .actualResult(
                            ActualResult.of(
                                ActualResultZero
                                    .builder()
                                    .type(ActualResultZeroType.VALUE)
                                    .build()
                            )
                        )
                        .passed(true)
                        .build()
                )
                .stdout("stdout")
                .build()
        )
        .traceResponses(
            Arrays.asList(
                TraceResponse
                    .builder()
                    .submissionId("submissionId")
                    .lineNumber(1)
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .build()
                    )
                    .build()
            )
        )
        .build()
);
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

**result:** `TestCaseResultWithStdout` 
    
</dd>
</dl>

<dl>
<dd>

**traceResponses:** `List<TraceResponse>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.storetracedtestcasev2(submissionId, testCaseId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().storetracedtestcasev2(
    "submissionId",
    "testCaseId",
    AdminStoreTracedTestCaseV2Request
        .builder()
        .body(
            Arrays.asList(
                TraceResponseV2
                    .builder()
                    .submissionId("submissionId")
                    .lineNumber(1)
                    .file(
                        TracedFile
                            .builder()
                            .filename("filename")
                            .directory("directory")
                            .build()
                    )
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .build()
                    )
                    .build()
            )
        )
        .build()
);
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

**request:** `List<TraceResponseV2>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.storetracedworkspace(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().storetracedworkspace(
    "submissionId",
    AdminStoreTracedWorkspaceRequest
        .builder()
        .workspaceRunDetails(
            WorkspaceRunDetails
                .builder()
                .stdout("stdout")
                .build()
        )
        .traceResponses(
            Arrays.asList(
                TraceResponse
                    .builder()
                    .submissionId("submissionId")
                    .lineNumber(1)
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .build()
                    )
                    .build()
            )
        )
        .build()
);
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

**workspaceRunDetails:** `WorkspaceRunDetails` 
    
</dd>
</dl>

<dl>
<dd>

**traceResponses:** `List<TraceResponse>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.storetracedworkspacev2(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().storetracedworkspacev2(
    "submissionId",
    AdminStoreTracedWorkspaceV2Request
        .builder()
        .body(
            Arrays.asList(
                TraceResponseV2
                    .builder()
                    .submissionId("submissionId")
                    .lineNumber(1)
                    .file(
                        TracedFile
                            .builder()
                            .filename("filename")
                            .directory("directory")
                            .build()
                    )
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .build()
                    )
                    .build()
            )
        )
        .build()
);
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

**request:** `List<TraceResponseV2>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>client.homepage.gethomepageproblems() -> List&amp;lt;String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.homepage().gethomepageproblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.sethomepageproblems(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.homepage().sethomepageproblems(
    Arrays.asList("string")
);
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

**request:** `List<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.migration.getattemptedmigrations() -> List&amp;lt;Migration&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.migration().getattemptedmigrations(
    MigrationGetAttemptedMigrationsRequest
        .builder()
        .adminKeyHeader("admin-key-header")
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.playlist.createplaylist(serviceParam, request) -> Playlist</code></summary>
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

```java
client.playlist().createplaylist(
    1,
    PlaylistCreatePlaylistRequest
        .builder()
        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .body(
            PlaylistCreateRequest
                .builder()
                .name("name")
                .problems(
                    Arrays.asList("problems")
                )
                .build()
        )
        .build()
);
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `OffsetDateTime` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDatetime:** `Optional<OffsetDateTime>` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `PlaylistCreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.getplaylists(serviceParam) -> List&amp;lt;Playlist&amp;gt;</code></summary>
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

```java
client.playlist().getplaylists(
    1,
    PlaylistGetPlaylistsRequest
        .builder()
        .otherField("otherField")
        .multiLineDocs("multiLineDocs")
        .optionalMultipleField(
            Arrays.asList(Optional.of("optionalMultipleField"))
        )
        .multipleField(
            Arrays.asList("multipleField")
        )
        .limit(1)
        .build()
);
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Optional<Integer>` 
    
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

**optionalMultipleField:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**multipleField:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.getplaylist(serviceParam, playlistId) -> Playlist</code></summary>
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

```java
client.playlist().getplaylist(
    1,
    "playlistId",
    PlaylistGetPlaylistRequest
        .builder()
        .build()
);
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.updateplaylist(serviceParam, playlistId, request) -> Playlist</code></summary>
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

```java
client.playlist().updateplaylist(
    1,
    "playlistId",
    UpdatePlaylistRequest
        .builder()
        .name("name")
        .problems(
            Arrays.asList("problems")
        )
        .build()
);
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problems:** `List<String>` — The problems that make up the playlist.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.deleteplaylist(serviceParam, playlistId)</code></summary>
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

```java
client.playlist().deleteplaylist(
    1,
    "playlist_id",
    PlaylistDeletePlaylistRequest
        .builder()
        .build()
);
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.problem.createproblem(request) -> CreateProblemResponse</code></summary>
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

```java
client.problem().createproblem(
    CreateProblemRequest
        .builder()
        .problemName("problemName")
        .problemDescription(
            ProblemDescription
                .builder()
                .boards(
                    Arrays.asList(
                        ProblemDescriptionBoard.html(
                            ProblemDescriptionBoardHtml
                                .builder()
                                .build()
                        )
                    )
                )
                .build()
        )
        .outputType(
            VariableType.of(
                VariableTypeZero
                    .builder()
                    .type(VariableTypeZeroType.INTEGER_TYPE)
                    .build()
            )
        )
        .methodName("methodName")
        .files(
            new HashMap<String, ProblemFiles>() {{
                put("key", ProblemFiles
                    .builder()
                    .solutionFile(
                        FileInfo
                            .builder()
                            .filename("filename")
                            .contents("contents")
                            .build()
                    )
                    .readOnlyFiles(
                        Arrays.asList(
                            FileInfo
                                .builder()
                                .filename("filename")
                                .contents("contents")
                                .build()
                        )
                    )
                    .build());
            }}
        )
        .inputParams(
            Arrays.asList(
                VariableTypeAndName
                    .builder()
                    .variableType(
                        VariableType.of(
                            VariableTypeZero
                                .builder()
                                .type(VariableTypeZeroType.INTEGER_TYPE)
                                .build()
                        )
                    )
                    .name("name")
                    .build()
            )
        )
        .testcases(
            Arrays.asList(
                TestCaseWithExpectedResult
                    .builder()
                    .testCase(
                        TestCase
                            .builder()
                            .id("id")
                            .params(
                                Arrays.asList(
                                    VariableValue.of(
                                        VariableValueZero
                                            .builder()
                                            .type(VariableValueZeroType.INTEGER_VALUE)
                                            .build()
                                    )
                                )
                            )
                            .build()
                    )
                    .expectedResult(
                        VariableValue.of(
                            VariableValueZero
                                .builder()
                                .type(VariableValueZeroType.INTEGER_VALUE)
                                .build()
                        )
                    )
                    .build()
            )
        )
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.updateproblem(problemId, request) -> UpdateProblemResponse</code></summary>
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

```java
client.problem().updateproblem(
    "problemId",
    ProblemUpdateProblemRequest
        .builder()
        .body(
            CreateProblemRequest
                .builder()
                .problemName("problemName")
                .problemDescription(
                    ProblemDescription
                        .builder()
                        .boards(
                            Arrays.asList(
                                ProblemDescriptionBoard.html(
                                    ProblemDescriptionBoardHtml
                                        .builder()
                                        .build()
                                )
                            )
                        )
                        .build()
                )
                .outputType(
                    VariableType.of(
                        VariableTypeZero
                            .builder()
                            .type(VariableTypeZeroType.INTEGER_TYPE)
                            .build()
                    )
                )
                .methodName("methodName")
                .files(
                    new HashMap<String, ProblemFiles>() {{
                        put("key", ProblemFiles
                            .builder()
                            .solutionFile(
                                FileInfo
                                    .builder()
                                    .filename("filename")
                                    .contents("contents")
                                    .build()
                            )
                            .readOnlyFiles(
                                Arrays.asList(
                                    FileInfo
                                        .builder()
                                        .filename("filename")
                                        .contents("contents")
                                        .build()
                                )
                            )
                            .build());
                    }}
                )
                .inputParams(
                    Arrays.asList(
                        VariableTypeAndName
                            .builder()
                            .variableType(
                                VariableType.of(
                                    VariableTypeZero
                                        .builder()
                                        .type(VariableTypeZeroType.INTEGER_TYPE)
                                        .build()
                                )
                            )
                            .name("name")
                            .build()
                    )
                )
                .testcases(
                    Arrays.asList(
                        TestCaseWithExpectedResult
                            .builder()
                            .testCase(
                                TestCase
                                    .builder()
                                    .id("id")
                                    .params(
                                        Arrays.asList(
                                            VariableValue.of(
                                                VariableValueZero
                                                    .builder()
                                                    .type(VariableValueZeroType.INTEGER_VALUE)
                                                    .build()
                                            )
                                        )
                                    )
                                    .build()
                            )
                            .expectedResult(
                                VariableValue.of(
                                    VariableValueZero
                                        .builder()
                                        .type(VariableValueZeroType.INTEGER_VALUE)
                                        .build()
                                )
                            )
                            .build()
                    )
                )
                .build()
        )
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.deleteproblem(problemId)</code></summary>
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

```java
client.problem().deleteproblem(
    "problemId",
    ProblemDeleteProblemRequest
        .builder()
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.getdefaultstarterfiles(request) -> GetDefaultStarterFilesResponse</code></summary>
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

```java
client.problem().getdefaultstarterfiles(
    ProblemGetDefaultStarterFilesRequest
        .builder()
        .outputType(
            VariableType.of(
                VariableTypeZero
                    .builder()
                    .type(VariableTypeZeroType.INTEGER_TYPE)
                    .build()
            )
        )
        .methodName("methodName")
        .inputParams(
            Arrays.asList(
                VariableTypeAndName
                    .builder()
                    .variableType(
                        VariableType.of(
                            VariableTypeZero
                                .builder()
                                .type(VariableTypeZeroType.INTEGER_TYPE)
                                .build()
                        )
                    )
                    .name("name")
                    .build()
            )
        )
        .build()
);
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

**inputParams:** `List<VariableTypeAndName>` 
    
</dd>
</dl>

<dl>
<dd>

**outputType:** `VariableType` 
    
</dd>
</dl>

<dl>
<dd>

**methodName:** `String` 

The name of the `method` that the student has to complete.
The method name cannot include the following characters:
  - Greater Than `>`
  - Less Than `<``
  - Equals `=`
  - Period `.`
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>client.submission.createexecutionsession(language) -> ExecutionSessionResponse</code></summary>
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

```java
client.submission().createexecutionsession(
    Language.JAVA,
    SubmissionCreateExecutionSessionRequest
        .builder()
        .build()
);
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

**language:** `Language` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.getexecutionsession(sessionId) -> ExecutionSessionResponse</code></summary>
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

```java
client.submission().getexecutionsession(
    "sessionId",
    SubmissionGetExecutionSessionRequest
        .builder()
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.stopexecutionsession(sessionId)</code></summary>
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

```java
client.submission().stopexecutionsession(
    "sessionId",
    SubmissionStopExecutionSessionRequest
        .builder()
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.getexecutionsessionsstate() -> GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.submission().getexecutionsessionsstate();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>client.sysprop.setnumwarminstances(language, numWarmInstances)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.sysprop().setnumwarminstances(
    Language.JAVA,
    1,
    SyspropSetNumWarmInstancesRequest
        .builder()
        .build()
);
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

**language:** `Language` 
    
</dd>
</dl>

<dl>
<dd>

**numWarmInstances:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.sysprop.getnumwarminstances() -> Map&amp;lt;String, Integer&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.sysprop().getnumwarminstances();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2Problem
<details><summary><code>client.v2Problem.v2ProblemGetLightweightProblems() -> List&amp;lt;V2LightweightProblemInfoV2&amp;gt;</code></summary>
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

```java
client.v2Problem().v2ProblemGetLightweightProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2Problem.v2ProblemGetProblems() -> List&amp;lt;V2ProblemInfoV2&amp;gt;</code></summary>
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

```java
client.v2Problem().v2ProblemGetProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2Problem.v2ProblemGetLatestProblem(problemId) -> V2ProblemInfoV2</code></summary>
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

```java
client.v2Problem().v2ProblemGetLatestProblem(
    "problemId",
    V2ProblemGetLatestProblemRequest
        .builder()
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2Problem.v2ProblemGetProblemVersion(problemId, problemVersion) -> V2ProblemInfoV2</code></summary>
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

```java
client.v2Problem().v2ProblemGetProblemVersion(
    "problemId",
    1,
    V2ProblemGetProblemVersionRequest
        .builder()
        .build()
);
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

**problemVersion:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2V3Problem
<details><summary><code>client.v2V3Problem.v2V3ProblemGetLightweightProblems() -> List&amp;lt;V2V3LightweightProblemInfoV2&amp;gt;</code></summary>
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

```java
client.v2V3Problem().v2V3ProblemGetLightweightProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2V3Problem.v2V3ProblemGetProblems() -> List&amp;lt;V2V3ProblemInfoV2&amp;gt;</code></summary>
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

```java
client.v2V3Problem().v2V3ProblemGetProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2V3Problem.v2V3ProblemGetLatestProblem(problemId) -> V2V3ProblemInfoV2</code></summary>
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

```java
client.v2V3Problem().v2V3ProblemGetLatestProblem(
    "problemId",
    V2V3ProblemGetLatestProblemRequest
        .builder()
        .build()
);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2V3Problem.v2V3ProblemGetProblemVersion(problemId, problemVersion) -> V2V3ProblemInfoV2</code></summary>
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

```java
client.v2V3Problem().v2V3ProblemGetProblemVersion(
    "problemId",
    1,
    V2V3ProblemGetProblemVersionRequest
        .builder()
        .build()
);
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

**problemVersion:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

