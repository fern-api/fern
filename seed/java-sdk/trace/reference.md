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
<details><summary><code>client.admin.updateTestSubmissionStatus(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().updateTestSubmissionStatus(
    UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    TestSubmissionStatus.stopped()
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

**submissionId:** `UUID` 
    
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

<details><summary><code>client.admin.sendTestSubmissionUpdate(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().sendTestSubmissionUpdate(
    UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    TestSubmissionUpdate
        .builder()
        .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .updateInfo(
            TestSubmissionUpdateInfo.running()
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

**submissionId:** `UUID` 
    
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

<details><summary><code>client.admin.updateWorkspaceSubmissionStatus(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().updateWorkspaceSubmissionStatus(
    UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    WorkspaceSubmissionStatus.stopped()
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

**submissionId:** `UUID` 
    
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

<details><summary><code>client.admin.sendWorkspaceSubmissionUpdate(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().sendWorkspaceSubmissionUpdate(
    UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    WorkspaceSubmissionUpdate
        .builder()
        .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .updateInfo(
            WorkspaceSubmissionUpdateInfo.running()
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

**submissionId:** `UUID` 
    
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

<details><summary><code>client.admin.storeTracedTestCase(submissionId, testCaseId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().storeTracedTestCase(
    UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    "testCaseId",
    StoreTracedTestCaseRequest
        .builder()
        .result(
            TestCaseResultWithStdout
                .builder()
                .result(
                    TestCaseResult
                        .builder()
                        .expectedResult(
                            VariableValue.integerValue()
                        )
                        .actualResult(
                            ActualResult.value(
                                VariableValue.integerValue()
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
                    .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                    .lineNumber(1)
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .topStackFrame(
                                StackFrame
                                    .builder()
                                    .methodName("methodName")
                                    .lineNumber(1)
                                    .scopes(
                                        Arrays.asList(
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build(),
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build()
                                        )
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .returnValue(
                        DebugVariableValue.integerValue()
                    )
                    .expressionLocation(
                        ExpressionLocation
                            .builder()
                            .start(1)
                            .offset(1)
                            .build()
                    )
                    .stdout("stdout")
                    .build(),
                TraceResponse
                    .builder()
                    .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                    .lineNumber(1)
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .topStackFrame(
                                StackFrame
                                    .builder()
                                    .methodName("methodName")
                                    .lineNumber(1)
                                    .scopes(
                                        Arrays.asList(
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build(),
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build()
                                        )
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .returnValue(
                        DebugVariableValue.integerValue()
                    )
                    .expressionLocation(
                        ExpressionLocation
                            .builder()
                            .start(1)
                            .offset(1)
                            .build()
                    )
                    .stdout("stdout")
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

**submissionId:** `UUID` 
    
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

<details><summary><code>client.admin.storeTracedTestCaseV2(submissionId, testCaseId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().storeTracedTestCaseV2(
    UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    "testCaseId",
    Arrays.asList(
        TraceResponseV2
            .builder()
            .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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
                    .topStackFrame(
                        StackFrame
                            .builder()
                            .methodName("methodName")
                            .lineNumber(1)
                            .scopes(
                                Arrays.asList(
                                    Scope
                                        .builder()
                                        .variables(
                                            new HashMap<String, DebugVariableValue>() {{
                                                put("variables", DebugVariableValue.integerValue());
                                            }}
                                        )
                                        .build(),
                                    Scope
                                        .builder()
                                        .variables(
                                            new HashMap<String, DebugVariableValue>() {{
                                                put("variables", DebugVariableValue.integerValue());
                                            }}
                                        )
                                        .build()
                                )
                            )
                            .build()
                    )
                    .build()
            )
            .returnValue(
                DebugVariableValue.integerValue()
            )
            .expressionLocation(
                ExpressionLocation
                    .builder()
                    .start(1)
                    .offset(1)
                    .build()
            )
            .stdout("stdout")
            .build(),
        TraceResponseV2
            .builder()
            .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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
                    .topStackFrame(
                        StackFrame
                            .builder()
                            .methodName("methodName")
                            .lineNumber(1)
                            .scopes(
                                Arrays.asList(
                                    Scope
                                        .builder()
                                        .variables(
                                            new HashMap<String, DebugVariableValue>() {{
                                                put("variables", DebugVariableValue.integerValue());
                                            }}
                                        )
                                        .build(),
                                    Scope
                                        .builder()
                                        .variables(
                                            new HashMap<String, DebugVariableValue>() {{
                                                put("variables", DebugVariableValue.integerValue());
                                            }}
                                        )
                                        .build()
                                )
                            )
                            .build()
                    )
                    .build()
            )
            .returnValue(
                DebugVariableValue.integerValue()
            )
            .expressionLocation(
                ExpressionLocation
                    .builder()
                    .start(1)
                    .offset(1)
                    .build()
            )
            .stdout("stdout")
            .build()
    )
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

**submissionId:** `UUID` 
    
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

<details><summary><code>client.admin.storeTracedWorkspace(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().storeTracedWorkspace(
    UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    StoreTracedWorkspaceRequest
        .builder()
        .workspaceRunDetails(
            WorkspaceRunDetails
                .builder()
                .stdout("stdout")
                .exceptionV2(
                    ExceptionV2.generic(
                        ExceptionInfo
                            .builder()
                            .exceptionType("exceptionType")
                            .exceptionMessage("exceptionMessage")
                            .exceptionStacktrace("exceptionStacktrace")
                            .build()
                    )
                )
                .exception(
                    ExceptionInfo
                        .builder()
                        .exceptionType("exceptionType")
                        .exceptionMessage("exceptionMessage")
                        .exceptionStacktrace("exceptionStacktrace")
                        .build()
                )
                .build()
        )
        .traceResponses(
            Arrays.asList(
                TraceResponse
                    .builder()
                    .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                    .lineNumber(1)
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .topStackFrame(
                                StackFrame
                                    .builder()
                                    .methodName("methodName")
                                    .lineNumber(1)
                                    .scopes(
                                        Arrays.asList(
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build(),
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build()
                                        )
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .returnValue(
                        DebugVariableValue.integerValue()
                    )
                    .expressionLocation(
                        ExpressionLocation
                            .builder()
                            .start(1)
                            .offset(1)
                            .build()
                    )
                    .stdout("stdout")
                    .build(),
                TraceResponse
                    .builder()
                    .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                    .lineNumber(1)
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .topStackFrame(
                                StackFrame
                                    .builder()
                                    .methodName("methodName")
                                    .lineNumber(1)
                                    .scopes(
                                        Arrays.asList(
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build(),
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build()
                                        )
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .returnValue(
                        DebugVariableValue.integerValue()
                    )
                    .expressionLocation(
                        ExpressionLocation
                            .builder()
                            .start(1)
                            .offset(1)
                            .build()
                    )
                    .stdout("stdout")
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

**submissionId:** `UUID` 
    
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

<details><summary><code>client.admin.storeTracedWorkspaceV2(submissionId, request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.admin().storeTracedWorkspaceV2(
    UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    Arrays.asList(
        TraceResponseV2
            .builder()
            .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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
                    .topStackFrame(
                        StackFrame
                            .builder()
                            .methodName("methodName")
                            .lineNumber(1)
                            .scopes(
                                Arrays.asList(
                                    Scope
                                        .builder()
                                        .variables(
                                            new HashMap<String, DebugVariableValue>() {{
                                                put("variables", DebugVariableValue.integerValue());
                                            }}
                                        )
                                        .build(),
                                    Scope
                                        .builder()
                                        .variables(
                                            new HashMap<String, DebugVariableValue>() {{
                                                put("variables", DebugVariableValue.integerValue());
                                            }}
                                        )
                                        .build()
                                )
                            )
                            .build()
                    )
                    .build()
            )
            .returnValue(
                DebugVariableValue.integerValue()
            )
            .expressionLocation(
                ExpressionLocation
                    .builder()
                    .start(1)
                    .offset(1)
                    .build()
            )
            .stdout("stdout")
            .build(),
        TraceResponseV2
            .builder()
            .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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
                    .topStackFrame(
                        StackFrame
                            .builder()
                            .methodName("methodName")
                            .lineNumber(1)
                            .scopes(
                                Arrays.asList(
                                    Scope
                                        .builder()
                                        .variables(
                                            new HashMap<String, DebugVariableValue>() {{
                                                put("variables", DebugVariableValue.integerValue());
                                            }}
                                        )
                                        .build(),
                                    Scope
                                        .builder()
                                        .variables(
                                            new HashMap<String, DebugVariableValue>() {{
                                                put("variables", DebugVariableValue.integerValue());
                                            }}
                                        )
                                        .build()
                                )
                            )
                            .build()
                    )
                    .build()
            )
            .returnValue(
                DebugVariableValue.integerValue()
            )
            .expressionLocation(
                ExpressionLocation
                    .builder()
                    .start(1)
                    .offset(1)
                    .build()
            )
            .stdout("stdout")
            .build()
    )
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

**submissionId:** `UUID` 
    
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
<details><summary><code>client.homepage.getHomepageProblems() -> List&lt;String&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.homepage().getHomepageProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.setHomepageProblems(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.homepage().setHomepageProblems(
    Arrays.asList("string", "string")
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
<details><summary><code>client.migration.getAttemptedMigrations() -> List&lt;Migration&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.migration().getAttemptedMigrations(
    GetAttemptedMigrationsRequest
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
<details><summary><code>client.playlist.createPlaylist(serviceParam, request) -> Playlist</code></summary>
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
client.playlist().createPlaylist(
    1,
    CreatePlaylistRequest
        .builder()
        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .body(
            PlaylistCreateRequest
                .builder()
                .name("name")
                .problems(
                    Arrays.asList("problems", "problems")
                )
                .build()
        )
        .optionalDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
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

<details><summary><code>client.playlist.getPlaylists(serviceParam) -> List&lt;Playlist&gt;</code></summary>
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
client.playlist().getPlaylists(
    1,
    GetPlaylistsRequest
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

**multipleField:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.getPlaylist(serviceParam, playlistId) -> Playlist</code></summary>
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
client.playlist().getPlaylist(1, "playlistId");
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

<details><summary><code>client.playlist.updatePlaylist(serviceParam, playlistId, request) -> Optional&lt;Playlist&gt;</code></summary>
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
client.playlist().updatePlaylist(
    1,
    "playlistId",
    Optional.of(
        UpdatePlaylistRequest
            .builder()
            .name("name")
            .problems(
                Arrays.asList("problems", "problems")
            )
            .build()
    )
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

**request:** `Optional<UpdatePlaylistRequest>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.deletePlaylist(serviceParam, playlistId)</code></summary>
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
client.playlist().deletePlaylist(1, "playlist_id");
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
<details><summary><code>client.problem.createProblem(request) -> CreateProblemResponse</code></summary>
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
client.problem().createProblem(
    CreateProblemRequest
        .builder()
        .problemName("problemName")
        .problemDescription(
            ProblemDescription
                .builder()
                .boards(
                    Arrays.asList(
                        ProblemDescriptionBoard.html(),
                        ProblemDescriptionBoard.html()
                    )
                )
                .build()
        )
        .outputType(
            VariableType.integerType()
        )
        .methodName("methodName")
        .files(
            new HashMap<Language, ProblemFiles>() {{
                put(Language.JAVA, ProblemFiles
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
                                .build(),
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
                        VariableType.integerType()
                    )
                    .name("name")
                    .build(),
                VariableTypeAndName
                    .builder()
                    .variableType(
                        VariableType.integerType()
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
                                    VariableValue.integerValue(),
                                    VariableValue.integerValue()
                                )
                            )
                            .build()
                    )
                    .expectedResult(
                        VariableValue.integerValue()
                    )
                    .build(),
                TestCaseWithExpectedResult
                    .builder()
                    .testCase(
                        TestCase
                            .builder()
                            .id("id")
                            .params(
                                Arrays.asList(
                                    VariableValue.integerValue(),
                                    VariableValue.integerValue()
                                )
                            )
                            .build()
                    )
                    .expectedResult(
                        VariableValue.integerValue()
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

<details><summary><code>client.problem.updateProblem(problemId, request) -> UpdateProblemResponse</code></summary>
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
client.problem().updateProblem(
    "problemId",
    CreateProblemRequest
        .builder()
        .problemName("problemName")
        .problemDescription(
            ProblemDescription
                .builder()
                .boards(
                    Arrays.asList(
                        ProblemDescriptionBoard.html(),
                        ProblemDescriptionBoard.html()
                    )
                )
                .build()
        )
        .outputType(
            VariableType.integerType()
        )
        .methodName("methodName")
        .files(
            new HashMap<Language, ProblemFiles>() {{
                put(Language.JAVA, ProblemFiles
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
                                .build(),
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
                        VariableType.integerType()
                    )
                    .name("name")
                    .build(),
                VariableTypeAndName
                    .builder()
                    .variableType(
                        VariableType.integerType()
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
                                    VariableValue.integerValue(),
                                    VariableValue.integerValue()
                                )
                            )
                            .build()
                    )
                    .expectedResult(
                        VariableValue.integerValue()
                    )
                    .build(),
                TestCaseWithExpectedResult
                    .builder()
                    .testCase(
                        TestCase
                            .builder()
                            .id("id")
                            .params(
                                Arrays.asList(
                                    VariableValue.integerValue(),
                                    VariableValue.integerValue()
                                )
                            )
                            .build()
                    )
                    .expectedResult(
                        VariableValue.integerValue()
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

<details><summary><code>client.problem.deleteProblem(problemId)</code></summary>
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
client.problem().deleteProblem("problemId");
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

<details><summary><code>client.problem.getDefaultStarterFiles(request) -> GetDefaultStarterFilesResponse</code></summary>
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
client.problem().getDefaultStarterFiles(
    GetDefaultStarterFilesRequest
        .builder()
        .outputType(
            VariableType.integerType()
        )
        .methodName("methodName")
        .inputParams(
            Arrays.asList(
                VariableTypeAndName
                    .builder()
                    .variableType(
                        VariableType.integerType()
                    )
                    .name("name")
                    .build(),
                VariableTypeAndName
                    .builder()
                    .variableType(
                        VariableType.integerType()
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
<details><summary><code>client.submission.createExecutionSession(language) -> ExecutionSessionResponse</code></summary>
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
client.submission().createExecutionSession(Language.JAVA);
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

<details><summary><code>client.submission.getExecutionSession(sessionId) -> Optional&lt;ExecutionSessionResponse&gt;</code></summary>
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
client.submission().getExecutionSession("sessionId");
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

<details><summary><code>client.submission.stopExecutionSession(sessionId)</code></summary>
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
client.submission().stopExecutionSession("sessionId");
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

<details><summary><code>client.submission.getExecutionSessionsState() -> GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.submission().getExecutionSessionsState();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>client.sysprop.setNumWarmInstances(language, numWarmInstances)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.sysprop().setNumWarmInstances(Language.JAVA, 1);
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

<details><summary><code>client.sysprop.getNumWarmInstances() -> Map&lt;Language, Integer&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.sysprop().getNumWarmInstances();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 Problem
<details><summary><code>client.v2.problem.getLightweightProblems() -> List&lt;LightweightProblemInfoV2&gt;</code></summary>
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
client.v2().problem().getLightweightProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.problem.getProblems() -> List&lt;ProblemInfoV2&gt;</code></summary>
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
client.v2().problem().getProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.problem.getLatestProblem(problemId) -> ProblemInfoV2</code></summary>
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
client.v2().problem().getLatestProblem("problemId");
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

<details><summary><code>client.v2.problem.getProblemVersion(problemId, problemVersion) -> ProblemInfoV2</code></summary>
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
client.v2().problem().getProblemVersion("problemId", 1);
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

## V2 V3 Problem
<details><summary><code>client.v2.v3.problem.getLightweightProblems() -> List&lt;LightweightProblemInfoV2&gt;</code></summary>
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
client.v2().problem().getLightweightProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.v3.problem.getProblems() -> List&lt;ProblemInfoV2&gt;</code></summary>
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
client.v2().problem().getProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.v3.problem.getLatestProblem(problemId) -> ProblemInfoV2</code></summary>
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
client.v2().problem().getLatestProblem("problemId");
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

<details><summary><code>client.v2.v3.problem.getProblemVersion(problemId, problemVersion) -> ProblemInfoV2</code></summary>
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
client.v2().problem().getProblemVersion("problemId", 1);
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
