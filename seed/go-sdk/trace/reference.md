# Reference
## V2
<details><summary><code>client.V2.Test() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.V2.Test(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>client.Admin.UpdateTestSubmissionStatus(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TestSubmissionStatus{
        Stopped: "stopped",
    }
client.Admin.UpdateTestSubmissionStatus(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        request,
    )
}
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

**submissionID:** `fern.SubmissionID` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.TestSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.SendTestSubmissionUpdate(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TestSubmissionUpdate{
        UpdateTime: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        UpdateInfo: &fern.TestSubmissionUpdateInfo{},
    }
client.Admin.SendTestSubmissionUpdate(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        request,
    )
}
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

**submissionID:** `fern.SubmissionID` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.TestSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.UpdateWorkspaceSubmissionStatus(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.WorkspaceSubmissionStatus{
        Stopped: "stopped",
    }
client.Admin.UpdateWorkspaceSubmissionStatus(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        request,
    )
}
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

**submissionID:** `fern.SubmissionID` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.WorkspaceSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.SendWorkspaceSubmissionUpdate(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.WorkspaceSubmissionUpdate{
        UpdateTime: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        UpdateInfo: &fern.WorkspaceSubmissionUpdateInfo{},
    }
client.Admin.SendWorkspaceSubmissionUpdate(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        request,
    )
}
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

**submissionID:** `fern.SubmissionID` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.WorkspaceSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.StoreTracedTestCase(SubmissionID, TestCaseID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.StoreTracedTestCaseRequest{
        Result: &fern.TestCaseResultWithStdout{
            Result: &fern.TestCaseResult{
                ExpectedResult: &common.VariableValue{},
                ActualResult: &fern.ActualResult{
                    Value: &common.VariableValue{},
                },
                Passed: true,
            },
            Stdout: "stdout",
        },
        TraceResponses: []*fern.TraceResponse{
            &fern.TraceResponse{
                SubmissionID: uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
                LineNumber: 1,
                ReturnValue: &fern.DebugVariableValue{},
                ExpressionLocation: &fern.ExpressionLocation{
                    Start: 1,
                    Offset: 1,
                },
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                    TopStackFrame: &fern.StackFrame{
                        MethodName: "methodName",
                        LineNumber: 1,
                        Scopes: []*fern.Scope{
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                        },
                    },
                },
                Stdout: fern.String(
                    "stdout",
                ),
            },
            &fern.TraceResponse{
                SubmissionID: uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
                LineNumber: 1,
                ReturnValue: &fern.DebugVariableValue{},
                ExpressionLocation: &fern.ExpressionLocation{
                    Start: 1,
                    Offset: 1,
                },
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                    TopStackFrame: &fern.StackFrame{
                        MethodName: "methodName",
                        LineNumber: 1,
                        Scopes: []*fern.Scope{
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                        },
                    },
                },
                Stdout: fern.String(
                    "stdout",
                ),
            },
        },
    }
client.Admin.StoreTracedTestCase(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        "testCaseId",
        request,
    )
}
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

**submissionID:** `fern.SubmissionID` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**result:** `*fern.TestCaseResultWithStdout` 
    
</dd>
</dl>

<dl>
<dd>

**traceResponses:** `[]*fern.TraceResponse` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.StoreTracedTestCaseV2(SubmissionID, TestCaseID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []*fern.TraceResponseV2{
        &fern.TraceResponseV2{
            SubmissionID: uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            LineNumber: 1,
            File: &fern.TracedFile{
                Filename: "filename",
                Directory: "directory",
            },
            ReturnValue: &fern.DebugVariableValue{},
            ExpressionLocation: &fern.ExpressionLocation{
                Start: 1,
                Offset: 1,
            },
            Stack: &fern.StackInformation{
                NumStackFrames: 1,
                TopStackFrame: &fern.StackFrame{
                    MethodName: "methodName",
                    LineNumber: 1,
                    Scopes: []*fern.Scope{
                        &fern.Scope{
                            Variables: map[string]*fern.DebugVariableValue{
                                "variables": &fern.DebugVariableValue{},
                            },
                        },
                        &fern.Scope{
                            Variables: map[string]*fern.DebugVariableValue{
                                "variables": &fern.DebugVariableValue{},
                            },
                        },
                    },
                },
            },
            Stdout: fern.String(
                "stdout",
            ),
        },
        &fern.TraceResponseV2{
            SubmissionID: uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            LineNumber: 1,
            File: &fern.TracedFile{
                Filename: "filename",
                Directory: "directory",
            },
            ReturnValue: &fern.DebugVariableValue{},
            ExpressionLocation: &fern.ExpressionLocation{
                Start: 1,
                Offset: 1,
            },
            Stack: &fern.StackInformation{
                NumStackFrames: 1,
                TopStackFrame: &fern.StackFrame{
                    MethodName: "methodName",
                    LineNumber: 1,
                    Scopes: []*fern.Scope{
                        &fern.Scope{
                            Variables: map[string]*fern.DebugVariableValue{
                                "variables": &fern.DebugVariableValue{},
                            },
                        },
                        &fern.Scope{
                            Variables: map[string]*fern.DebugVariableValue{
                                "variables": &fern.DebugVariableValue{},
                            },
                        },
                    },
                },
            },
            Stdout: fern.String(
                "stdout",
            ),
        },
    }
client.Admin.StoreTracedTestCaseV2(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        "testCaseId",
        request,
    )
}
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

**submissionID:** `fern.SubmissionID` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseID:** `v2.TestCaseID` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `[]*fern.TraceResponseV2` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.StoreTracedWorkspace(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.StoreTracedWorkspaceRequest{
        WorkspaceRunDetails: &fern.WorkspaceRunDetails{
            ExceptionV2: &fern.ExceptionV2{
                Generic: &fern.ExceptionInfo{
                    ExceptionType: "exceptionType",
                    ExceptionMessage: "exceptionMessage",
                    ExceptionStacktrace: "exceptionStacktrace",
                },
            },
            Exception: &fern.ExceptionInfo{
                ExceptionType: "exceptionType",
                ExceptionMessage: "exceptionMessage",
                ExceptionStacktrace: "exceptionStacktrace",
            },
            Stdout: "stdout",
        },
        TraceResponses: []*fern.TraceResponse{
            &fern.TraceResponse{
                SubmissionID: uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
                LineNumber: 1,
                ReturnValue: &fern.DebugVariableValue{},
                ExpressionLocation: &fern.ExpressionLocation{
                    Start: 1,
                    Offset: 1,
                },
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                    TopStackFrame: &fern.StackFrame{
                        MethodName: "methodName",
                        LineNumber: 1,
                        Scopes: []*fern.Scope{
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                        },
                    },
                },
                Stdout: fern.String(
                    "stdout",
                ),
            },
            &fern.TraceResponse{
                SubmissionID: uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
                LineNumber: 1,
                ReturnValue: &fern.DebugVariableValue{},
                ExpressionLocation: &fern.ExpressionLocation{
                    Start: 1,
                    Offset: 1,
                },
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                    TopStackFrame: &fern.StackFrame{
                        MethodName: "methodName",
                        LineNumber: 1,
                        Scopes: []*fern.Scope{
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                        },
                    },
                },
                Stdout: fern.String(
                    "stdout",
                ),
            },
        },
    }
client.Admin.StoreTracedWorkspace(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        request,
    )
}
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

**submissionID:** `fern.SubmissionID` 
    
</dd>
</dl>

<dl>
<dd>

**workspaceRunDetails:** `*fern.WorkspaceRunDetails` 
    
</dd>
</dl>

<dl>
<dd>

**traceResponses:** `[]*fern.TraceResponse` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.StoreTracedWorkspaceV2(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []*fern.TraceResponseV2{
        &fern.TraceResponseV2{
            SubmissionID: uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            LineNumber: 1,
            File: &fern.TracedFile{
                Filename: "filename",
                Directory: "directory",
            },
            ReturnValue: &fern.DebugVariableValue{},
            ExpressionLocation: &fern.ExpressionLocation{
                Start: 1,
                Offset: 1,
            },
            Stack: &fern.StackInformation{
                NumStackFrames: 1,
                TopStackFrame: &fern.StackFrame{
                    MethodName: "methodName",
                    LineNumber: 1,
                    Scopes: []*fern.Scope{
                        &fern.Scope{
                            Variables: map[string]*fern.DebugVariableValue{
                                "variables": &fern.DebugVariableValue{},
                            },
                        },
                        &fern.Scope{
                            Variables: map[string]*fern.DebugVariableValue{
                                "variables": &fern.DebugVariableValue{},
                            },
                        },
                    },
                },
            },
            Stdout: fern.String(
                "stdout",
            ),
        },
        &fern.TraceResponseV2{
            SubmissionID: uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            LineNumber: 1,
            File: &fern.TracedFile{
                Filename: "filename",
                Directory: "directory",
            },
            ReturnValue: &fern.DebugVariableValue{},
            ExpressionLocation: &fern.ExpressionLocation{
                Start: 1,
                Offset: 1,
            },
            Stack: &fern.StackInformation{
                NumStackFrames: 1,
                TopStackFrame: &fern.StackFrame{
                    MethodName: "methodName",
                    LineNumber: 1,
                    Scopes: []*fern.Scope{
                        &fern.Scope{
                            Variables: map[string]*fern.DebugVariableValue{
                                "variables": &fern.DebugVariableValue{},
                            },
                        },
                        &fern.Scope{
                            Variables: map[string]*fern.DebugVariableValue{
                                "variables": &fern.DebugVariableValue{},
                            },
                        },
                    },
                },
            },
            Stdout: fern.String(
                "stdout",
            ),
        },
    }
client.Admin.StoreTracedWorkspaceV2(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        request,
    )
}
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

**submissionID:** `fern.SubmissionID` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `[]*fern.TraceResponseV2` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>client.Homepage.GetHomepageProblems() -> []common.ProblemID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Homepage.GetHomepageProblems(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Homepage.SetHomepageProblems(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []common.ProblemID{
        "string",
        "string",
    }
client.Homepage.SetHomepageProblems(
        context.TODO(),
        request,
    )
}
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

**request:** `[]common.ProblemID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.Migration.GetAttemptedMigrations() -> []*fern.Migration</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetAttemptedMigrationsRequest{
        AdminKeyHeader: "admin-key-header",
    }
client.Migration.GetAttemptedMigrations(
        context.TODO(),
        request,
    )
}
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

**adminKeyHeader:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.Playlist.CreatePlaylist(ServiceParam, request) -> *fern.Playlist</code></summary>
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

```go
request := &fern.CreatePlaylistRequest{
        Datetime: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        OptionalDatetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Body: &fern.PlaylistCreateRequest{
            Name: "name",
            Problems: []common.ProblemID{
                "problems",
                "problems",
            },
        },
    }
client.Playlist.CreatePlaylist(
        context.TODO(),
        1,
        request,
    )
}
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDatetime:** `*time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.PlaylistCreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.GetPlaylists(ServiceParam) -> []*fern.Playlist</code></summary>
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

```go
request := &fern.GetPlaylistsRequest{
        Limit: fern.Int(
            1,
        ),
        OtherField: "otherField",
        MultiLineDocs: "multiLineDocs",
        OptionalMultipleField: []*string{
            fern.String(
                "optionalMultipleField",
            ),
        },
        MultipleField: []string{
            "multipleField",
        },
    }
client.Playlist.GetPlaylists(
        context.TODO(),
        1,
        request,
    )
}
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `*int` 
    
</dd>
</dl>

<dl>
<dd>

**otherField:** `string` — i'm another field
    
</dd>
</dl>

<dl>
<dd>

**multiLineDocs:** `string` 

I'm a multiline
description
    
</dd>
</dl>

<dl>
<dd>

**optionalMultipleField:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**multipleField:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.GetPlaylist(ServiceParam, PlaylistID) -> *fern.Playlist</code></summary>
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

```go
client.Playlist.GetPlaylist(
        context.TODO(),
        1,
        "playlistId",
    )
}
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**playlistID:** `fern.PlaylistID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.UpdatePlaylist(ServiceParam, PlaylistID, request) -> *fern.Playlist</code></summary>
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

```go
request := &fern.UpdatePlaylistRequest{
        Name: "name",
        Problems: []common.ProblemID{
            "problems",
            "problems",
        },
    }
client.Playlist.UpdatePlaylist(
        context.TODO(),
        1,
        "playlistId",
        request,
    )
}
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**playlistID:** `fern.PlaylistID` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.UpdatePlaylistRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.DeletePlaylist(ServiceParam, PlaylistID) -> error</code></summary>
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

```go
client.Playlist.DeletePlaylist(
        context.TODO(),
        1,
        "playlist_id",
    )
}
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**playlistID:** `fern.PlaylistID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.Problem.CreateProblem(request) -> *fern.CreateProblemResponse</code></summary>
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

```go
request := &fern.CreateProblemRequest{
        ProblemName: "problemName",
        ProblemDescription: &common.ProblemDescription{
            Boards: []*common.ProblemDescriptionBoard{
                &common.ProblemDescriptionBoard{},
                &common.ProblemDescriptionBoard{},
            },
        },
        Files: map[common.Language]*fern.ProblemFiles{
            common.LanguageJava: &fern.ProblemFiles{
                SolutionFile: &fern.FileInfo{
                    Filename: "filename",
                    Contents: "contents",
                },
                ReadOnlyFiles: []*fern.FileInfo{
                    &fern.FileInfo{
                        Filename: "filename",
                        Contents: "contents",
                    },
                    &fern.FileInfo{
                        Filename: "filename",
                        Contents: "contents",
                    },
                },
            },
        },
        InputParams: []*fern.VariableTypeAndName{
            &fern.VariableTypeAndName{
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
            &fern.VariableTypeAndName{
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
        },
        OutputType: &common.VariableType{
            IntegerType: "integerType",
        },
        Testcases: []*fern.TestCaseWithExpectedResult{
            &fern.TestCaseWithExpectedResult{
                TestCase: &fern.TestCase{
                    ID: "id",
                    Params: []*common.VariableValue{
                        &common.VariableValue{},
                        &common.VariableValue{},
                    },
                },
                ExpectedResult: &common.VariableValue{},
            },
            &fern.TestCaseWithExpectedResult{
                TestCase: &fern.TestCase{
                    ID: "id",
                    Params: []*common.VariableValue{
                        &common.VariableValue{},
                        &common.VariableValue{},
                    },
                },
                ExpectedResult: &common.VariableValue{},
            },
        },
        MethodName: "methodName",
    }
client.Problem.CreateProblem(
        context.TODO(),
        request,
    )
}
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

**request:** `*fern.CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Problem.UpdateProblem(ProblemID, request) -> *fern.UpdateProblemResponse</code></summary>
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

```go
request := &fern.CreateProblemRequest{
        ProblemName: "problemName",
        ProblemDescription: &common.ProblemDescription{
            Boards: []*common.ProblemDescriptionBoard{
                &common.ProblemDescriptionBoard{},
                &common.ProblemDescriptionBoard{},
            },
        },
        Files: map[common.Language]*fern.ProblemFiles{
            common.LanguageJava: &fern.ProblemFiles{
                SolutionFile: &fern.FileInfo{
                    Filename: "filename",
                    Contents: "contents",
                },
                ReadOnlyFiles: []*fern.FileInfo{
                    &fern.FileInfo{
                        Filename: "filename",
                        Contents: "contents",
                    },
                    &fern.FileInfo{
                        Filename: "filename",
                        Contents: "contents",
                    },
                },
            },
        },
        InputParams: []*fern.VariableTypeAndName{
            &fern.VariableTypeAndName{
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
            &fern.VariableTypeAndName{
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
        },
        OutputType: &common.VariableType{
            IntegerType: "integerType",
        },
        Testcases: []*fern.TestCaseWithExpectedResult{
            &fern.TestCaseWithExpectedResult{
                TestCase: &fern.TestCase{
                    ID: "id",
                    Params: []*common.VariableValue{
                        &common.VariableValue{},
                        &common.VariableValue{},
                    },
                },
                ExpectedResult: &common.VariableValue{},
            },
            &fern.TestCaseWithExpectedResult{
                TestCase: &fern.TestCase{
                    ID: "id",
                    Params: []*common.VariableValue{
                        &common.VariableValue{},
                        &common.VariableValue{},
                    },
                },
                ExpectedResult: &common.VariableValue{},
            },
        },
        MethodName: "methodName",
    }
client.Problem.UpdateProblem(
        context.TODO(),
        "problemId",
        request,
    )
}
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

**problemID:** `common.ProblemID` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Problem.DeleteProblem(ProblemID) -> error</code></summary>
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

```go
client.Problem.DeleteProblem(
        context.TODO(),
        "problemId",
    )
}
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

**problemID:** `common.ProblemID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Problem.GetDefaultStarterFiles(request) -> *fern.GetDefaultStarterFilesResponse</code></summary>
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

```go
request := &fern.GetDefaultStarterFilesRequest{
        InputParams: []*fern.VariableTypeAndName{
            &fern.VariableTypeAndName{
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
            &fern.VariableTypeAndName{
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
        },
        OutputType: &common.VariableType{
            IntegerType: "integerType",
        },
        MethodName: "methodName",
    }
client.Problem.GetDefaultStarterFiles(
        context.TODO(),
        request,
    )
}
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

**inputParams:** `[]*fern.VariableTypeAndName` 
    
</dd>
</dl>

<dl>
<dd>

**outputType:** `*common.VariableType` 
    
</dd>
</dl>

<dl>
<dd>

**methodName:** `string` 

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
<details><summary><code>client.Submission.CreateExecutionSession(Language) -> *fern.ExecutionSessionResponse</code></summary>
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

```go
client.Submission.CreateExecutionSession(
        context.TODO(),
        common.LanguageJava.Ptr(),
    )
}
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

**language:** `*common.Language` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.GetExecutionSession(SessionID) -> *fern.ExecutionSessionResponse</code></summary>
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

```go
client.Submission.GetExecutionSession(
        context.TODO(),
        "sessionId",
    )
}
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

**sessionID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.StopExecutionSession(SessionID) -> error</code></summary>
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

```go
client.Submission.StopExecutionSession(
        context.TODO(),
        "sessionId",
    )
}
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

**sessionID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.GetExecutionSessionsState() -> *fern.GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Submission.GetExecutionSessionsState(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>client.Sysprop.SetNumWarmInstances(Language, NumWarmInstances) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Sysprop.SetNumWarmInstances(
        context.TODO(),
        common.LanguageJava.Ptr(),
        1,
    )
}
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

**language:** `*common.Language` 
    
</dd>
</dl>

<dl>
<dd>

**numWarmInstances:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Sysprop.GetNumWarmInstances() -> map[*common.Language]int</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Sysprop.GetNumWarmInstances(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 Problem
<details><summary><code>client.V2.Problem.GetLightweightProblems() -> []*v2.LightweightProblemInfoV2</code></summary>
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

```go
client.V2.Problem.GetLightweightProblems(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.Problem.GetProblems() -> []*v2.ProblemInfoV2</code></summary>
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

```go
client.V2.Problem.GetProblems(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.Problem.GetLatestProblem(ProblemID) -> *v2.ProblemInfoV2</code></summary>
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

```go
client.V2.Problem.GetLatestProblem(
        context.TODO(),
        "problemId",
    )
}
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

**problemID:** `common.ProblemID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.Problem.GetProblemVersion(ProblemID, ProblemVersion) -> *v2.ProblemInfoV2</code></summary>
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

```go
client.V2.Problem.GetProblemVersion(
        context.TODO(),
        "problemId",
        1,
    )
}
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

**problemID:** `common.ProblemID` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 V3 Problem
<details><summary><code>client.V2.V3.Problem.GetLightweightProblems() -> []*v3.LightweightProblemInfoV2</code></summary>
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

```go
client.V2.Problem.GetLightweightProblems(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.V3.Problem.GetProblems() -> []*v3.ProblemInfoV2</code></summary>
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

```go
client.V2.Problem.GetProblems(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.V3.Problem.GetLatestProblem(ProblemID) -> *v3.ProblemInfoV2</code></summary>
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

```go
client.V2.Problem.GetLatestProblem(
        context.TODO(),
        "problemId",
    )
}
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

**problemID:** `common.ProblemID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.V3.Problem.GetProblemVersion(ProblemID, ProblemVersion) -> *v3.ProblemInfoV2</code></summary>
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

```go
client.V2.Problem.GetProblemVersion(
        context.TODO(),
        "problemId",
        1,
    )
}
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

**problemID:** `common.ProblemID` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

