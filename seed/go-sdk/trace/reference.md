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
<details><summary><code>client.Admin.Updatetestsubmissionstatus(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AdminUpdateTestSubmissionStatusRequest{
        SubmissionID: "submissionId",
        Body: &fern.TestSubmissionStatus{
            Stopped: &fern.TestSubmissionStatusStopped{},
        },
    }
client.Admin.Updatetestsubmissionstatus(
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

<details><summary><code>client.Admin.Sendtestsubmissionupdate(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AdminSendTestSubmissionUpdateRequest{
        SubmissionID: "submissionId",
        Body: &fern.TestSubmissionUpdate{
            UpdateTime: fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            UpdateInfo: &fern.TestSubmissionUpdateInfo{
                TestSubmissionUpdateInfoZero: &fern.TestSubmissionUpdateInfoZero{
                    Type: fern.TestSubmissionUpdateInfoZeroTypeRunning,
                },
            },
        },
    }
client.Admin.Sendtestsubmissionupdate(
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

<details><summary><code>client.Admin.Updateworkspacesubmissionstatus(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AdminUpdateWorkspaceSubmissionStatusRequest{
        SubmissionID: "submissionId",
        Body: &fern.WorkspaceSubmissionStatus{
            WorkspaceSubmissionStatusZero: &fern.WorkspaceSubmissionStatusZero{
                Type: fern.WorkspaceSubmissionStatusZeroTypeStopped,
            },
        },
    }
client.Admin.Updateworkspacesubmissionstatus(
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

<details><summary><code>client.Admin.Sendworkspacesubmissionupdate(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AdminSendWorkspaceSubmissionUpdateRequest{
        SubmissionID: "submissionId",
        Body: &fern.WorkspaceSubmissionUpdate{
            UpdateTime: fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            UpdateInfo: &fern.WorkspaceSubmissionUpdateInfo{
                WorkspaceSubmissionUpdateInfoZero: &fern.WorkspaceSubmissionUpdateInfoZero{
                    Type: fern.WorkspaceSubmissionUpdateInfoZeroTypeRunning,
                },
            },
        },
    }
client.Admin.Sendworkspacesubmissionupdate(
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

<details><summary><code>client.Admin.Storetracedtestcase(SubmissionID, TestCaseID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AdminStoreTracedTestCaseRequest{
        SubmissionID: "submissionId",
        TestCaseID: "testCaseId",
        Result: &fern.TestCaseResultWithStdout{
            Result: &fern.TestCaseResult{
                ExpectedResult: &fern.VariableValue{
                    VariableValueZero: &fern.VariableValueZero{
                        Type: fern.VariableValueZeroTypeIntegerValue,
                    },
                },
                ActualResult: &fern.ActualResult{
                    ActualResultZero: &fern.ActualResultZero{
                        Type: fern.ActualResultZeroTypeValue,
                    },
                },
                Passed: true,
            },
            Stdout: "stdout",
        },
        TraceResponses: []*fern.TraceResponse{
            &fern.TraceResponse{
                SubmissionID: "submissionId",
                LineNumber: 1,
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                },
            },
        },
    }
client.Admin.Storetracedtestcase(
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

<details><summary><code>client.Admin.Storetracedtestcasev2(SubmissionID, TestCaseID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AdminStoreTracedTestCaseV2Request{
        SubmissionID: "submissionId",
        TestCaseID: "testCaseId",
        Body: []*fern.TraceResponseV2{
            &fern.TraceResponseV2{
                SubmissionID: "submissionId",
                LineNumber: 1,
                File: &fern.TracedFile{
                    Filename: "filename",
                    Directory: "directory",
                },
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                },
            },
        },
    }
client.Admin.Storetracedtestcasev2(
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

**submissionID:** `fern.SubmissionID` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseID:** `fern.V2TestCaseID` 
    
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

<details><summary><code>client.Admin.Storetracedworkspace(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AdminStoreTracedWorkspaceRequest{
        SubmissionID: "submissionId",
        WorkspaceRunDetails: &fern.WorkspaceRunDetails{
            Stdout: "stdout",
        },
        TraceResponses: []*fern.TraceResponse{
            &fern.TraceResponse{
                SubmissionID: "submissionId",
                LineNumber: 1,
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                },
            },
        },
    }
client.Admin.Storetracedworkspace(
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

<details><summary><code>client.Admin.Storetracedworkspacev2(SubmissionID, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AdminStoreTracedWorkspaceV2Request{
        SubmissionID: "submissionId",
        Body: []*fern.TraceResponseV2{
            &fern.TraceResponseV2{
                SubmissionID: "submissionId",
                LineNumber: 1,
                File: &fern.TracedFile{
                    Filename: "filename",
                    Directory: "directory",
                },
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                },
            },
        },
    }
client.Admin.Storetracedworkspacev2(
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
<details><summary><code>client.Homepage.Gethomepageproblems() -> []fern.ProblemID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Homepage.Gethomepageproblems(
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

<details><summary><code>client.Homepage.Sethomepageproblems(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := []fern.ProblemID{
        "string",
    }
client.Homepage.Sethomepageproblems(
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

**request:** `[]fern.ProblemID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.Migration.Getattemptedmigrations() -> []*fern.Migration</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.MigrationGetAttemptedMigrationsRequest{
        AdminKeyHeader: "admin-key-header",
    }
client.Migration.Getattemptedmigrations(
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
<details><summary><code>client.Playlist.Createplaylist(ServiceParam, request) -> *fern.Playlist</code></summary>
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
request := &fern.PlaylistCreatePlaylistRequest{
        ServiceParam: 1,
        Datetime: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        Body: &fern.PlaylistCreateRequest{
            Name: "name",
            Problems: []fern.ProblemID{
                "problems",
            },
        },
    }
client.Playlist.Createplaylist(
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

<details><summary><code>client.Playlist.Getplaylists(ServiceParam) -> []*fern.Playlist</code></summary>
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
request := &fern.PlaylistGetPlaylistsRequest{
        ServiceParam: 1,
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
        MultipleField: []*string{
            fern.String(
                "multipleField",
            ),
        },
    }
client.Playlist.Getplaylists(
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

**multipleField:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.Getplaylist(ServiceParam, PlaylistID) -> *fern.Playlist</code></summary>
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
request := &fern.PlaylistGetPlaylistRequest{
        ServiceParam: 1,
        PlaylistID: "playlistId",
    }
client.Playlist.Getplaylist(
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

<details><summary><code>client.Playlist.Updateplaylist(ServiceParam, PlaylistID, request) -> *fern.Playlist</code></summary>
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
        ServiceParam: 1,
        PlaylistID: "playlistId",
        Name: "name",
        Problems: []fern.ProblemID{
            "problems",
        },
    }
client.Playlist.Updateplaylist(
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

**name:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**problems:** `[]fern.ProblemID` — The problems that make up the playlist.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.Deleteplaylist(ServiceParam, PlaylistID) -> error</code></summary>
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
request := &fern.PlaylistDeletePlaylistRequest{
        ServiceParam: 1,
        PlaylistID: "playlist_id",
    }
client.Playlist.Deleteplaylist(
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
<details><summary><code>client.Problem.Createproblem(request) -> *fern.CreateProblemResponse</code></summary>
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
        ProblemDescription: &fern.ProblemDescription{
            Boards: []*fern.ProblemDescriptionBoard{
                &fern.ProblemDescriptionBoard{
                    HTML: &fern.ProblemDescriptionBoardHTML{},
                },
            },
        },
        Files: map[string]*fern.ProblemFiles{
            "key": &fern.ProblemFiles{
                SolutionFile: &fern.FileInfo{
                    Filename: "filename",
                    Contents: "contents",
                },
                ReadOnlyFiles: []*fern.FileInfo{
                    &fern.FileInfo{
                        Filename: "filename",
                        Contents: "contents",
                    },
                },
            },
        },
        InputParams: []*fern.VariableTypeAndName{
            &fern.VariableTypeAndName{
                VariableType: &fern.VariableType{
                    VariableTypeZero: &fern.VariableTypeZero{
                        Type: fern.VariableTypeZeroTypeIntegerType,
                    },
                },
                Name: "name",
            },
        },
        OutputType: &fern.VariableType{
            VariableTypeZero: &fern.VariableTypeZero{
                Type: fern.VariableTypeZeroTypeIntegerType,
            },
        },
        Testcases: []*fern.TestCaseWithExpectedResult{
            &fern.TestCaseWithExpectedResult{
                TestCase: &fern.TestCase{
                    ID: "id",
                    Params: []*fern.VariableValue{
                        &fern.VariableValue{
                            VariableValueZero: &fern.VariableValueZero{
                                Type: fern.VariableValueZeroTypeIntegerValue,
                            },
                        },
                    },
                },
                ExpectedResult: &fern.VariableValue{
                    VariableValueZero: &fern.VariableValueZero{
                        Type: fern.VariableValueZeroTypeIntegerValue,
                    },
                },
            },
        },
        MethodName: "methodName",
    }
client.Problem.Createproblem(
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

<details><summary><code>client.Problem.Updateproblem(ProblemID, request) -> *fern.UpdateProblemResponse</code></summary>
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
request := &fern.ProblemUpdateProblemRequest{
        ProblemID: "problemId",
        Body: &fern.CreateProblemRequest{
            ProblemName: "problemName",
            ProblemDescription: &fern.ProblemDescription{
                Boards: []*fern.ProblemDescriptionBoard{
                    &fern.ProblemDescriptionBoard{
                        HTML: &fern.ProblemDescriptionBoardHTML{},
                    },
                },
            },
            Files: map[string]*fern.ProblemFiles{
                "key": &fern.ProblemFiles{
                    SolutionFile: &fern.FileInfo{
                        Filename: "filename",
                        Contents: "contents",
                    },
                    ReadOnlyFiles: []*fern.FileInfo{
                        &fern.FileInfo{
                            Filename: "filename",
                            Contents: "contents",
                        },
                    },
                },
            },
            InputParams: []*fern.VariableTypeAndName{
                &fern.VariableTypeAndName{
                    VariableType: &fern.VariableType{
                        VariableTypeZero: &fern.VariableTypeZero{
                            Type: fern.VariableTypeZeroTypeIntegerType,
                        },
                    },
                    Name: "name",
                },
            },
            OutputType: &fern.VariableType{
                VariableTypeZero: &fern.VariableTypeZero{
                    Type: fern.VariableTypeZeroTypeIntegerType,
                },
            },
            Testcases: []*fern.TestCaseWithExpectedResult{
                &fern.TestCaseWithExpectedResult{
                    TestCase: &fern.TestCase{
                        ID: "id",
                        Params: []*fern.VariableValue{
                            &fern.VariableValue{
                                VariableValueZero: &fern.VariableValueZero{
                                    Type: fern.VariableValueZeroTypeIntegerValue,
                                },
                            },
                        },
                    },
                    ExpectedResult: &fern.VariableValue{
                        VariableValueZero: &fern.VariableValueZero{
                            Type: fern.VariableValueZeroTypeIntegerValue,
                        },
                    },
                },
            },
            MethodName: "methodName",
        },
    }
client.Problem.Updateproblem(
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

**problemID:** `fern.ProblemID` 
    
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

<details><summary><code>client.Problem.Deleteproblem(ProblemID) -> error</code></summary>
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
request := &fern.ProblemDeleteProblemRequest{
        ProblemID: "problemId",
    }
client.Problem.Deleteproblem(
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

**problemID:** `fern.ProblemID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Problem.Getdefaultstarterfiles(request) -> *fern.GetDefaultStarterFilesResponse</code></summary>
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
request := &fern.ProblemGetDefaultStarterFilesRequest{
        InputParams: []*fern.VariableTypeAndName{
            &fern.VariableTypeAndName{
                VariableType: &fern.VariableType{
                    VariableTypeZero: &fern.VariableTypeZero{
                        Type: fern.VariableTypeZeroTypeIntegerType,
                    },
                },
                Name: "name",
            },
        },
        OutputType: &fern.VariableType{
            VariableTypeZero: &fern.VariableTypeZero{
                Type: fern.VariableTypeZeroTypeIntegerType,
            },
        },
        MethodName: "methodName",
    }
client.Problem.Getdefaultstarterfiles(
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

**outputType:** `*fern.VariableType` 
    
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
<details><summary><code>client.Submission.Createexecutionsession(Language) -> *fern.ExecutionSessionResponse</code></summary>
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
request := &fern.SubmissionCreateExecutionSessionRequest{
        Language: fern.LanguageJava.Ptr(),
    }
client.Submission.Createexecutionsession(
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

**language:** `*fern.Language` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.Getexecutionsession(SessionID) -> *fern.ExecutionSessionResponse</code></summary>
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
request := &fern.SubmissionGetExecutionSessionRequest{
        SessionID: "sessionId",
    }
client.Submission.Getexecutionsession(
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

**sessionID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.Stopexecutionsession(SessionID) -> error</code></summary>
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
request := &fern.SubmissionStopExecutionSessionRequest{
        SessionID: "sessionId",
    }
client.Submission.Stopexecutionsession(
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

**sessionID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.Getexecutionsessionsstate() -> *fern.GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Submission.Getexecutionsessionsstate(
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
<details><summary><code>client.Sysprop.Setnumwarminstances(Language, NumWarmInstances) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SyspropSetNumWarmInstancesRequest{
        Language: fern.LanguageJava.Ptr(),
        NumWarmInstances: 1,
    }
client.Sysprop.Setnumwarminstances(
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

**language:** `*fern.Language` 
    
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

<details><summary><code>client.Sysprop.Getnumwarminstances() -> map[string]int</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Sysprop.Getnumwarminstances(
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

## V2Problem
<details><summary><code>client.V2Problem.V2ProblemGetLightweightProblems() -> []*fern.V2LightweightProblemInfoV2</code></summary>
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
client.V2Problem.V2ProblemGetLightweightProblems(
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

<details><summary><code>client.V2Problem.V2ProblemGetProblems() -> []*fern.V2ProblemInfoV2</code></summary>
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
client.V2Problem.V2ProblemGetProblems(
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

<details><summary><code>client.V2Problem.V2ProblemGetLatestProblem(ProblemID) -> *fern.V2ProblemInfoV2</code></summary>
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
request := &fern.V2ProblemGetLatestProblemRequest{
        ProblemID: "problemId",
    }
client.V2Problem.V2ProblemGetLatestProblem(
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

**problemID:** `fern.ProblemID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2Problem.V2ProblemGetProblemVersion(ProblemID, ProblemVersion) -> *fern.V2ProblemInfoV2</code></summary>
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
request := &fern.V2ProblemGetProblemVersionRequest{
        ProblemID: "problemId",
        ProblemVersion: 1,
    }
client.V2Problem.V2ProblemGetProblemVersion(
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

**problemID:** `fern.ProblemID` 
    
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

## V2V3Problem
<details><summary><code>client.V2V3Problem.V2V3ProblemGetLightweightProblems() -> []*fern.V2V3LightweightProblemInfoV2</code></summary>
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
client.V2V3Problem.V2V3ProblemGetLightweightProblems(
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

<details><summary><code>client.V2V3Problem.V2V3ProblemGetProblems() -> []*fern.V2V3ProblemInfoV2</code></summary>
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
client.V2V3Problem.V2V3ProblemGetProblems(
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

<details><summary><code>client.V2V3Problem.V2V3ProblemGetLatestProblem(ProblemID) -> *fern.V2V3ProblemInfoV2</code></summary>
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
request := &fern.V2V3ProblemGetLatestProblemRequest{
        ProblemID: "problemId",
    }
client.V2V3Problem.V2V3ProblemGetLatestProblem(
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

**problemID:** `fern.ProblemID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2V3Problem.V2V3ProblemGetProblemVersion(ProblemID, ProblemVersion) -> *fern.V2V3ProblemInfoV2</code></summary>
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
request := &fern.V2V3ProblemGetProblemVersionRequest{
        ProblemID: "problemId",
        ProblemVersion: 1,
    }
client.V2V3Problem.V2V3ProblemGetProblemVersion(
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

**problemID:** `fern.ProblemID` 
    
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

