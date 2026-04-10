# Reference
## V2
<details><summary><code>client.v2.<a href="/src/api/resources/v2/client.rs">test</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.v2.test(None).await;
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
<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">updatetestsubmissionstatus</a>(submission_id: SubmissionId, request: TestSubmissionStatus) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .admin
        .updatetestsubmissionstatus(
            &SubmissionId("submissionId".to_string()),
            &TestSubmissionStatus::stopped(),
            None,
        )
        .await;
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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">sendtestsubmissionupdate</a>(submission_id: SubmissionId, request: TestSubmissionUpdate) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .admin
        .sendtestsubmissionupdate(
            &SubmissionId("submissionId".to_string()),
            &TestSubmissionUpdate {
                update_time: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                update_info: TestSubmissionUpdateInfo::TestSubmissionUpdateInfoZero(
                    TestSubmissionUpdateInfoZero {
                        r#type: TestSubmissionUpdateInfoZeroType::Running,
                        value: None,
                    },
                ),
            },
            None,
        )
        .await;
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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">updateworkspacesubmissionstatus</a>(submission_id: SubmissionId, request: WorkspaceSubmissionStatus) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .admin
        .updateworkspacesubmissionstatus(
            &SubmissionId("submissionId".to_string()),
            &WorkspaceSubmissionStatus::WorkspaceSubmissionStatusZero(
                WorkspaceSubmissionStatusZero {
                    r#type: WorkspaceSubmissionStatusZeroType::Stopped,
                },
            ),
            None,
        )
        .await;
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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">sendworkspacesubmissionupdate</a>(submission_id: SubmissionId, request: WorkspaceSubmissionUpdate) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .admin
        .sendworkspacesubmissionupdate(
            &SubmissionId("submissionId".to_string()),
            &WorkspaceSubmissionUpdate {
                update_time: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                update_info: WorkspaceSubmissionUpdateInfo::WorkspaceSubmissionUpdateInfoZero(
                    WorkspaceSubmissionUpdateInfoZero {
                        r#type: WorkspaceSubmissionUpdateInfoZeroType::Running,
                        value: None,
                    },
                ),
            },
            None,
        )
        .await;
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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">storetracedtestcase</a>(submission_id: SubmissionId, test_case_id: String, request: AdminStoreTracedTestCaseRequest) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .admin
        .storetracedtestcase(
            &SubmissionId("submissionId".to_string()),
            &"testCaseId".to_string(),
            &AdminStoreTracedTestCaseRequest {
                result: TestCaseResultWithStdout {
                    result: TestCaseResult {
                        expected_result: VariableValue::VariableValueZero(VariableValueZero {
                            r#type: VariableValueZeroType::IntegerValue,
                            value: None,
                        }),
                        actual_result: ActualResult::ActualResultZero(ActualResultZero {
                            r#type: ActualResultZeroType::Value,
                            value: None,
                        }),
                        passed: true,
                    },
                    stdout: "stdout".to_string(),
                },
                trace_responses: vec![TraceResponse {
                    submission_id: SubmissionId("submissionId".to_string()),
                    line_number: 1,
                    stack: StackInformation {
                        num_stack_frames: 1,
                        ..Default::default()
                    },
                    ..Default::default()
                }],
            },
            None,
        )
        .await;
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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**test_case_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**result:** `TestCaseResultWithStdout` 
    
</dd>
</dl>

<dl>
<dd>

**trace_responses:** `Vec<TraceResponse>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">storetracedtestcasev2</a>(submission_id: SubmissionId, test_case_id: V2TestCaseId, request: Vec&lt;TraceResponseV2&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .admin
        .storetracedtestcasev2(
            &SubmissionId("submissionId".to_string()),
            &V2TestCaseId("testCaseId".to_string()),
            &vec![TraceResponseV2 {
                submission_id: SubmissionId("submissionId".to_string()),
                line_number: 1,
                file: TracedFile {
                    filename: "filename".to_string(),
                    directory: "directory".to_string(),
                    ..Default::default()
                },
                stack: StackInformation {
                    num_stack_frames: 1,
                    ..Default::default()
                },
                ..Default::default()
            }],
            None,
        )
        .await;
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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**test_case_id:** `V2TestCaseId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">storetracedworkspace</a>(submission_id: SubmissionId, request: AdminStoreTracedWorkspaceRequest) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .admin
        .storetracedworkspace(
            &SubmissionId("submissionId".to_string()),
            &AdminStoreTracedWorkspaceRequest {
                workspace_run_details: WorkspaceRunDetails {
                    stdout: "stdout".to_string(),
                    ..Default::default()
                },
                trace_responses: vec![TraceResponse {
                    submission_id: SubmissionId("submissionId".to_string()),
                    line_number: 1,
                    stack: StackInformation {
                        num_stack_frames: 1,
                        ..Default::default()
                    },
                    ..Default::default()
                }],
            },
            None,
        )
        .await;
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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**workspace_run_details:** `WorkspaceRunDetails` 
    
</dd>
</dl>

<dl>
<dd>

**trace_responses:** `Vec<TraceResponse>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">storetracedworkspacev2</a>(submission_id: SubmissionId, request: Vec&lt;TraceResponseV2&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .admin
        .storetracedworkspacev2(
            &SubmissionId("submissionId".to_string()),
            &vec![TraceResponseV2 {
                submission_id: SubmissionId("submissionId".to_string()),
                line_number: 1,
                file: TracedFile {
                    filename: "filename".to_string(),
                    directory: "directory".to_string(),
                    ..Default::default()
                },
                stack: StackInformation {
                    num_stack_frames: 1,
                    ..Default::default()
                },
                ..Default::default()
            }],
            None,
        )
        .await;
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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>client.homepage.<a href="/src/api/resources/homepage/client.rs">gethomepageproblems</a>() -> Result&lt;Vec&lt;ProblemId&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.homepage.gethomepageproblems(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.<a href="/src/api/resources/homepage/client.rs">sethomepageproblems</a>(request: Vec&lt;ProblemId&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .homepage
        .sethomepageproblems(&vec![ProblemId("string".to_string())], None)
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.migration.<a href="/src/api/resources/migration/client.rs">getattemptedmigrations</a>() -> Result&lt;Vec&lt;Migration&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .migration
        .getattemptedmigrations(Some(
            RequestOptions::new().additional_header("admin-key-header", "admin-key-header"),
        ))
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">createplaylist</a>(service_param: i64, request: PlaylistCreateRequest, datetime: Option&lt;String&gt;, optional_datetime: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;Playlist, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .playlist
        .createplaylist(
            1,
            &CreateplaylistRequest {
                datetime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                body: PlaylistCreateRequest {
                    name: "name".to_string(),
                    problems: vec![ProblemId("problems".to_string())],
                    ..Default::default()
                },
                optional_datetime: None,
            },
            None,
        )
        .await;
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

**service_param:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_datetime:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">getplaylists</a>(service_param: i64, limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, other_field: Option&lt;String&gt;, multi_line_docs: Option&lt;String&gt;) -> Result&lt;Vec&lt;Playlist&gt;, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .playlist
        .getplaylists(
            1,
            &GetplaylistsQueryRequest {
                limit: Some(1),
                other_field: "otherField".to_string(),
                multi_line_docs: "multiLineDocs".to_string(),
                optional_multiple_field: vec![Some("optionalMultipleField".to_string())],
                multiple_field: vec![Some("multipleField".to_string())],
            },
            None,
        )
        .await;
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

**service_param:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<Option<i64>>` 
    
</dd>
</dl>

<dl>
<dd>

**other_field:** `String` — i'm another field
    
</dd>
</dl>

<dl>
<dd>

**multi_line_docs:** `String` 

I'm a multiline
description
    
</dd>
</dl>

<dl>
<dd>

**optional_multiple_field:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**multiple_field:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">getplaylist</a>(service_param: i64, playlist_id: PlaylistId) -> Result&lt;Playlist, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .playlist
        .getplaylist(1, &PlaylistId("playlistId".to_string()), None)
        .await;
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

**service_param:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `PlaylistId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">updateplaylist</a>(service_param: i64, playlist_id: PlaylistId, request: UpdatePlaylistRequest) -> Result&lt;Playlist, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .playlist
        .updateplaylist(
            1,
            &PlaylistId("playlistId".to_string()),
            &UpdatePlaylistRequest {
                name: "name".to_string(),
                problems: vec![ProblemId("problems".to_string())],
            },
            None,
        )
        .await;
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

**service_param:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `PlaylistId` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problems:** `Vec<ProblemId>` — The problems that make up the playlist.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">deleteplaylist</a>(service_param: i64, playlist_id: PlaylistId) -> Result&lt;(), ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .playlist
        .deleteplaylist(1, &PlaylistId("playlist_id".to_string()), None)
        .await;
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

**service_param:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `PlaylistId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.problem.<a href="/src/api/resources/problem/client.rs">createproblem</a>(request: CreateProblemRequest) -> Result&lt;CreateProblemResponse, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .problem
        .createproblem(
            &CreateProblemRequest {
                problem_name: "problemName".to_string(),
                problem_description: ProblemDescription {
                    boards: vec![ProblemDescriptionBoard::Html {
                        data: ProblemDescriptionBoardHtml {
                            ..Default::default()
                        },
                    }],
                    ..Default::default()
                },
                files: HashMap::from([(
                    "key".to_string(),
                    ProblemFiles {
                        solution_file: FileInfo {
                            filename: "filename".to_string(),
                            contents: "contents".to_string(),
                            ..Default::default()
                        },
                        read_only_files: vec![FileInfo {
                            filename: "filename".to_string(),
                            contents: "contents".to_string(),
                            ..Default::default()
                        }],
                        ..Default::default()
                    },
                )]),
                input_params: vec![VariableTypeAndName {
                    variable_type: VariableType::VariableTypeZero(VariableTypeZero {
                        r#type: VariableTypeZeroType::IntegerType,
                    }),
                    name: "name".to_string(),
                }],
                output_type: VariableType::VariableTypeZero(VariableTypeZero {
                    r#type: VariableTypeZeroType::IntegerType,
                }),
                testcases: vec![TestCaseWithExpectedResult {
                    test_case: TestCase {
                        id: "id".to_string(),
                        params: vec![VariableValue::VariableValueZero(VariableValueZero {
                            r#type: VariableValueZeroType::IntegerValue,
                            value: None,
                        })],
                        ..Default::default()
                    },
                    expected_result: VariableValue::VariableValueZero(VariableValueZero {
                        r#type: VariableValueZeroType::IntegerValue,
                        value: None,
                    }),
                }],
                method_name: "methodName".to_string(),
            },
            None,
        )
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client.rs">updateproblem</a>(problem_id: ProblemId, request: CreateProblemRequest) -> Result&lt;UpdateProblemResponse, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .problem
        .updateproblem(
            &ProblemId("problemId".to_string()),
            &CreateProblemRequest {
                problem_name: "problemName".to_string(),
                problem_description: ProblemDescription {
                    boards: vec![ProblemDescriptionBoard::Html {
                        data: ProblemDescriptionBoardHtml {
                            ..Default::default()
                        },
                    }],
                    ..Default::default()
                },
                files: HashMap::from([(
                    "key".to_string(),
                    ProblemFiles {
                        solution_file: FileInfo {
                            filename: "filename".to_string(),
                            contents: "contents".to_string(),
                            ..Default::default()
                        },
                        read_only_files: vec![FileInfo {
                            filename: "filename".to_string(),
                            contents: "contents".to_string(),
                            ..Default::default()
                        }],
                        ..Default::default()
                    },
                )]),
                input_params: vec![VariableTypeAndName {
                    variable_type: VariableType::VariableTypeZero(VariableTypeZero {
                        r#type: VariableTypeZeroType::IntegerType,
                    }),
                    name: "name".to_string(),
                }],
                output_type: VariableType::VariableTypeZero(VariableTypeZero {
                    r#type: VariableTypeZeroType::IntegerType,
                }),
                testcases: vec![TestCaseWithExpectedResult {
                    test_case: TestCase {
                        id: "id".to_string(),
                        params: vec![VariableValue::VariableValueZero(VariableValueZero {
                            r#type: VariableValueZeroType::IntegerValue,
                            value: None,
                        })],
                        ..Default::default()
                    },
                    expected_result: VariableValue::VariableValueZero(VariableValueZero {
                        r#type: VariableValueZeroType::IntegerValue,
                        value: None,
                    }),
                }],
                method_name: "methodName".to_string(),
            },
            None,
        )
        .await;
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

**problem_id:** `ProblemId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client.rs">deleteproblem</a>(problem_id: ProblemId) -> Result&lt;(), ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .problem
        .deleteproblem(&ProblemId("problemId".to_string()), None)
        .await;
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

**problem_id:** `ProblemId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client.rs">getdefaultstarterfiles</a>(request: ProblemGetDefaultStarterFilesRequest) -> Result&lt;GetDefaultStarterFilesResponse, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .problem
        .getdefaultstarterfiles(
            &ProblemGetDefaultStarterFilesRequest {
                input_params: vec![VariableTypeAndName {
                    variable_type: VariableType::VariableTypeZero(VariableTypeZero {
                        r#type: VariableTypeZeroType::IntegerType,
                    }),
                    name: "name".to_string(),
                }],
                output_type: VariableType::VariableTypeZero(VariableTypeZero {
                    r#type: VariableTypeZeroType::IntegerType,
                }),
                method_name: "methodName".to_string(),
            },
            None,
        )
        .await;
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

**input_params:** `Vec<VariableTypeAndName>` 
    
</dd>
</dl>

<dl>
<dd>

**output_type:** `VariableType` 
    
</dd>
</dl>

<dl>
<dd>

**method_name:** `String` 

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
<details><summary><code>client.submission.<a href="/src/api/resources/submission/client.rs">createexecutionsession</a>(language: Language) -> Result&lt;ExecutionSessionResponse, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .submission
        .createexecutionsession(&Language::Java, None)
        .await;
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

**language:** `Language` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client.rs">getexecutionsession</a>(session_id: String) -> Result&lt;ExecutionSessionResponse, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .submission
        .getexecutionsession(&"sessionId".to_string(), None)
        .await;
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

**session_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client.rs">stopexecutionsession</a>(session_id: String) -> Result&lt;(), ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .submission
        .stopexecutionsession(&"sessionId".to_string(), None)
        .await;
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

**session_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client.rs">getexecutionsessionsstate</a>() -> Result&lt;GetExecutionSessionStateResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.submission.getexecutionsessionsstate(None).await;
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
<details><summary><code>client.sysprop.<a href="/src/api/resources/sysprop/client.rs">setnumwarminstances</a>(language: Language, num_warm_instances: i64) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .sysprop
        .setnumwarminstances(&Language::Java, 1, None)
        .await;
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

**language:** `Language` 
    
</dd>
</dl>

<dl>
<dd>

**num_warm_instances:** `i64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.sysprop.<a href="/src/api/resources/sysprop/client.rs">getnumwarminstances</a>() -> Result&lt;std::collections::HashMap&lt;String, i64&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.sysprop.getnumwarminstances(None).await;
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
<details><summary><code>client.v2problem.<a href="/src/api/resources/v2problem/client.rs">v2problem_get_lightweight_problems</a>() -> Result&lt;Vec&lt;V2LightweightProblemInfoV2&gt;, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .v2problem
        .v2problem_get_lightweight_problems(None)
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2problem.<a href="/src/api/resources/v2problem/client.rs">v2problem_get_problems</a>() -> Result&lt;Vec&lt;V2ProblemInfoV2&gt;, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.v2problem.v2problem_get_problems(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2problem.<a href="/src/api/resources/v2problem/client.rs">v2problem_get_latest_problem</a>(problem_id: ProblemId) -> Result&lt;V2ProblemInfoV2, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .v2problem
        .v2problem_get_latest_problem(&ProblemId("problemId".to_string()), None)
        .await;
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

**problem_id:** `ProblemId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2problem.<a href="/src/api/resources/v2problem/client.rs">v2problem_get_problem_version</a>(problem_id: ProblemId, problem_version: i64) -> Result&lt;V2ProblemInfoV2, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .v2problem
        .v2problem_get_problem_version(&ProblemId("problemId".to_string()), 1, None)
        .await;
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

**problem_id:** `ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**problem_version:** `i64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2V3Problem
<details><summary><code>client.v2v3problem.<a href="/src/api/resources/v2v3problem/client.rs">v2v3problem_get_lightweight_problems</a>() -> Result&lt;Vec&lt;V2V3LightweightProblemInfoV2&gt;, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .v2v3problem
        .v2v3problem_get_lightweight_problems(None)
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2v3problem.<a href="/src/api/resources/v2v3problem/client.rs">v2v3problem_get_problems</a>() -> Result&lt;Vec&lt;V2V3ProblemInfoV2&gt;, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.v2v3problem.v2v3problem_get_problems(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2v3problem.<a href="/src/api/resources/v2v3problem/client.rs">v2v3problem_get_latest_problem</a>(problem_id: ProblemId) -> Result&lt;V2V3ProblemInfoV2, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .v2v3problem
        .v2v3problem_get_latest_problem(&ProblemId("problemId".to_string()), None)
        .await;
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

**problem_id:** `ProblemId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2v3problem.<a href="/src/api/resources/v2v3problem/client.rs">v2v3problem_get_problem_version</a>(problem_id: ProblemId, problem_version: i64) -> Result&lt;V2V3ProblemInfoV2, ApiError&gt;</code></summary>
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

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .v2v3problem
        .v2v3problem_get_problem_version(&ProblemId("problemId".to_string()), 1, None)
        .await;
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

**problem_id:** `ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**problem_version:** `i64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

