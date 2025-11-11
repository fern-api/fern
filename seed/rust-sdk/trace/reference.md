# Reference
## V2
<details><summary><code>client.v_2.<a href="/src/api/resources/v_2/client.rs">test</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.v_2.test(None).await;
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
<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">update_test_submission_status</a>(submission_id: SubmissionId, request: TestSubmissionStatus) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .admin
        .update_test_submission_status(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &TestSubmissionStatus::Stopped,
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">send_test_submission_update</a>(submission_id: SubmissionId, request: TestSubmissionUpdate) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .admin
        .send_test_submission_update(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &TestSubmissionUpdate {
                update_time: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                    .unwrap()
                    .with_timezone(&Utc),
                update_info: TestSubmissionUpdateInfo::Running { value: None },
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">update_workspace_submission_status</a>(submission_id: SubmissionId, request: WorkspaceSubmissionStatus) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .admin
        .update_workspace_submission_status(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &WorkspaceSubmissionStatus::Stopped,
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">send_workspace_submission_update</a>(submission_id: SubmissionId, request: WorkspaceSubmissionUpdate) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .admin
        .send_workspace_submission_update(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &WorkspaceSubmissionUpdate {
                update_time: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                    .unwrap()
                    .with_timezone(&Utc),
                update_info: WorkspaceSubmissionUpdateInfo::Running { value: None },
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">store_traced_test_case</a>(submission_id: SubmissionId, test_case_id: String, request: StoreTracedTestCaseRequest) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .admin
        .store_traced_test_case(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &"testCaseId".to_string(),
            &StoreTracedTestCaseRequest {
                result: TestCaseResultWithStdout {
                    result: TestCaseResult {
                        expected_result: VariableValue::IntegerValue { value: None },
                        actual_result: ActualResult::Value {
                            value: VariableValue::IntegerValue { value: None },
                        },
                        passed: true,
                    },
                    stdout: "stdout".to_string(),
                },
                trace_responses: vec![
                    TraceResponse {
                        submission_id: SubmissionId(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        line_number: 1,
                        return_value: Some(DebugVariableValue::IntegerValue { value: None }),
                        expression_location: Some(ExpressionLocation {
                            start: 1,
                            offset: 1,
                        }),
                        stack: StackInformation {
                            num_stack_frames: 1,
                            top_stack_frame: Some(StackFrame {
                                method_name: "methodName".to_string(),
                                line_number: 1,
                                scopes: vec![
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                ],
                            }),
                        },
                        stdout: Some("stdout".to_string()),
                    },
                    TraceResponse {
                        submission_id: SubmissionId(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        line_number: 1,
                        return_value: Some(DebugVariableValue::IntegerValue { value: None }),
                        expression_location: Some(ExpressionLocation {
                            start: 1,
                            offset: 1,
                        }),
                        stack: StackInformation {
                            num_stack_frames: 1,
                            top_stack_frame: Some(StackFrame {
                                method_name: "methodName".to_string(),
                                line_number: 1,
                                scopes: vec![
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                ],
                            }),
                        },
                        stdout: Some("stdout".to_string()),
                    },
                ],
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">store_traced_test_case_v_2</a>(submission_id: SubmissionId, test_case_id: TestCaseId, request: Vec<TraceResponseV2>) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .admin
        .store_traced_test_case_v_2(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &TestCaseId("testCaseId".to_string()),
            &vec![
                TraceResponseV2 {
                    submission_id: SubmissionId(
                        Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                    ),
                    line_number: 1,
                    file: TracedFile {
                        filename: "filename".to_string(),
                        directory: "directory".to_string(),
                    },
                    return_value: Some(DebugVariableValue::IntegerValue { value: None }),
                    expression_location: Some(ExpressionLocation {
                        start: 1,
                        offset: 1,
                    }),
                    stack: StackInformation {
                        num_stack_frames: 1,
                        top_stack_frame: Some(StackFrame {
                            method_name: "methodName".to_string(),
                            line_number: 1,
                            scopes: vec![
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: None },
                                    )]),
                                },
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: None },
                                    )]),
                                },
                            ],
                        }),
                    },
                    stdout: Some("stdout".to_string()),
                },
                TraceResponseV2 {
                    submission_id: SubmissionId(
                        Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                    ),
                    line_number: 1,
                    file: TracedFile {
                        filename: "filename".to_string(),
                        directory: "directory".to_string(),
                    },
                    return_value: Some(DebugVariableValue::IntegerValue { value: None }),
                    expression_location: Some(ExpressionLocation {
                        start: 1,
                        offset: 1,
                    }),
                    stack: StackInformation {
                        num_stack_frames: 1,
                        top_stack_frame: Some(StackFrame {
                            method_name: "methodName".to_string(),
                            line_number: 1,
                            scopes: vec![
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: None },
                                    )]),
                                },
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: None },
                                    )]),
                                },
                            ],
                        }),
                    },
                    stdout: Some("stdout".to_string()),
                },
            ],
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

**test_case_id:** `TestCaseId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">store_traced_workspace</a>(submission_id: SubmissionId, request: StoreTracedWorkspaceRequest) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .admin
        .store_traced_workspace(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &StoreTracedWorkspaceRequest {
                workspace_run_details: WorkspaceRunDetails {
                    exception_v_2: Some(ExceptionV2::Generic {
                        data: ExceptionInfo {
                            exception_type: "exceptionType".to_string(),
                            exception_message: "exceptionMessage".to_string(),
                            exception_stacktrace: "exceptionStacktrace".to_string(),
                        },
                    }),
                    exception: Some(ExceptionInfo {
                        exception_type: "exceptionType".to_string(),
                        exception_message: "exceptionMessage".to_string(),
                        exception_stacktrace: "exceptionStacktrace".to_string(),
                    }),
                    stdout: "stdout".to_string(),
                },
                trace_responses: vec![
                    TraceResponse {
                        submission_id: SubmissionId(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        line_number: 1,
                        return_value: Some(DebugVariableValue::IntegerValue { value: None }),
                        expression_location: Some(ExpressionLocation {
                            start: 1,
                            offset: 1,
                        }),
                        stack: StackInformation {
                            num_stack_frames: 1,
                            top_stack_frame: Some(StackFrame {
                                method_name: "methodName".to_string(),
                                line_number: 1,
                                scopes: vec![
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                ],
                            }),
                        },
                        stdout: Some("stdout".to_string()),
                    },
                    TraceResponse {
                        submission_id: SubmissionId(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        line_number: 1,
                        return_value: Some(DebugVariableValue::IntegerValue { value: None }),
                        expression_location: Some(ExpressionLocation {
                            start: 1,
                            offset: 1,
                        }),
                        stack: StackInformation {
                            num_stack_frames: 1,
                            top_stack_frame: Some(StackFrame {
                                method_name: "methodName".to_string(),
                                line_number: 1,
                                scopes: vec![
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                ],
                            }),
                        },
                        stdout: Some("stdout".to_string()),
                    },
                ],
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client.rs">store_traced_workspace_v_2</a>(submission_id: SubmissionId, request: Vec<TraceResponseV2>) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .admin
        .store_traced_workspace_v_2(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &vec![
                TraceResponseV2 {
                    submission_id: SubmissionId(
                        Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                    ),
                    line_number: 1,
                    file: TracedFile {
                        filename: "filename".to_string(),
                        directory: "directory".to_string(),
                    },
                    return_value: Some(DebugVariableValue::IntegerValue { value: None }),
                    expression_location: Some(ExpressionLocation {
                        start: 1,
                        offset: 1,
                    }),
                    stack: StackInformation {
                        num_stack_frames: 1,
                        top_stack_frame: Some(StackFrame {
                            method_name: "methodName".to_string(),
                            line_number: 1,
                            scopes: vec![
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: None },
                                    )]),
                                },
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: None },
                                    )]),
                                },
                            ],
                        }),
                    },
                    stdout: Some("stdout".to_string()),
                },
                TraceResponseV2 {
                    submission_id: SubmissionId(
                        Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                    ),
                    line_number: 1,
                    file: TracedFile {
                        filename: "filename".to_string(),
                        directory: "directory".to_string(),
                    },
                    return_value: Some(DebugVariableValue::IntegerValue { value: None }),
                    expression_location: Some(ExpressionLocation {
                        start: 1,
                        offset: 1,
                    }),
                    stack: StackInformation {
                        num_stack_frames: 1,
                        top_stack_frame: Some(StackFrame {
                            method_name: "methodName".to_string(),
                            line_number: 1,
                            scopes: vec![
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: None },
                                    )]),
                                },
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: None },
                                    )]),
                                },
                            ],
                        }),
                    },
                    stdout: Some("stdout".to_string()),
                },
            ],
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
<details><summary><code>client.homepage.<a href="/src/api/resources/homepage/client.rs">get_homepage_problems</a>() -> Result<Vec<ProblemId>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.homepage.get_homepage_problems(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.<a href="/src/api/resources/homepage/client.rs">set_homepage_problems</a>(request: Vec<ProblemId>) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .homepage
        .set_homepage_problems(
            &vec![
                ProblemId("string".to_string()),
                ProblemId("string".to_string()),
            ],
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

## Migration
<details><summary><code>client.migration.<a href="/src/api/resources/migration/client.rs">get_attempted_migrations</a>() -> Result<Vec<Migration>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.migration.get_attempted_migrations(None).await;
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
<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">create_playlist</a>(service_param: i64, request: PlaylistCreateRequest, datetime: Option<String>, optional_datetime: Option<Option<String>>) -> Result<Playlist, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .playlist
        .create_playlist(
            &1,
            &CreatePlaylistRequest {
                datetime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                    .unwrap()
                    .with_timezone(&Utc),
                optional_datetime: Some(
                    DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                ),
                body: PlaylistCreateRequest {
                    name: "name".to_string(),
                    problems: vec![
                        ProblemId("problems".to_string()),
                        ProblemId("problems".to_string()),
                    ],
                },
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

**optional_datetime:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">get_playlists</a>(service_param: i64, limit: Option<Option<i64>>, other_field: Option<String>, multi_line_docs: Option<String>) -> Result<Vec<Playlist>, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .playlist
        .get_playlists(
            &1,
            &GetPlaylistsQueryRequest {
                limit: Some(1),
                other_field: "otherField".to_string(),
                multi_line_docs: "multiLineDocs".to_string(),
                optional_multiple_field: vec![Some("optionalMultipleField".to_string())],
                multiple_field: vec!["multipleField".to_string()],
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

**limit:** `Option<i64>` 
    
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

**optional_multiple_field:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**multiple_field:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">get_playlist</a>(service_param: i64, playlist_id: PlaylistId) -> Result<Playlist, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .playlist
        .get_playlist(&1, &PlaylistId("playlistId".to_string()), None)
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

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">update_playlist</a>(service_param: i64, playlist_id: PlaylistId, request: Option<UpdatePlaylistRequest>) -> Result<Option<Playlist>, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .playlist
        .update_playlist(
            &1,
            &PlaylistId("playlistId".to_string()),
            &Some(UpdatePlaylistRequest {
                name: "name".to_string(),
                problems: vec![
                    ProblemId("problems".to_string()),
                    ProblemId("problems".to_string()),
                ],
            }),
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client.rs">delete_playlist</a>(service_param: i64, playlist_id: PlaylistId) -> Result<(), ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .playlist
        .delete_playlist(&1, &PlaylistId("playlist_id".to_string()), None)
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
<details><summary><code>client.problem.<a href="/src/api/resources/problem/client.rs">create_problem</a>(request: CreateProblemRequest) -> Result<CreateProblemResponse, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .problem
        .create_problem(
            &CreateProblemRequest {
                problem_name: "problemName".to_string(),
                problem_description: ProblemDescription {
                    boards: vec![
                        ProblemDescriptionBoard::Html { value: None },
                        ProblemDescriptionBoard::Html { value: None },
                    ],
                },
                files: HashMap::from([(
                    Language::Java,
                    ProblemFiles {
                        solution_file: FileInfo {
                            filename: "filename".to_string(),
                            contents: "contents".to_string(),
                        },
                        read_only_files: vec![
                            FileInfo {
                                filename: "filename".to_string(),
                                contents: "contents".to_string(),
                            },
                            FileInfo {
                                filename: "filename".to_string(),
                                contents: "contents".to_string(),
                            },
                        ],
                    },
                )]),
                input_params: vec![
                    VariableTypeAndName {
                        variable_type: VariableType::IntegerType,
                        name: "name".to_string(),
                    },
                    VariableTypeAndName {
                        variable_type: VariableType::IntegerType,
                        name: "name".to_string(),
                    },
                ],
                output_type: VariableType::IntegerType,
                testcases: vec![
                    TestCaseWithExpectedResult {
                        test_case: TestCase {
                            id: "id".to_string(),
                            params: vec![
                                VariableValue::IntegerValue { value: None },
                                VariableValue::IntegerValue { value: None },
                            ],
                        },
                        expected_result: VariableValue::IntegerValue { value: None },
                    },
                    TestCaseWithExpectedResult {
                        test_case: TestCase {
                            id: "id".to_string(),
                            params: vec![
                                VariableValue::IntegerValue { value: None },
                                VariableValue::IntegerValue { value: None },
                            ],
                        },
                        expected_result: VariableValue::IntegerValue { value: None },
                    },
                ],
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

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client.rs">update_problem</a>(problem_id: ProblemId, request: CreateProblemRequest) -> Result<UpdateProblemResponse, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .problem
        .update_problem(
            &ProblemId("problemId".to_string()),
            &CreateProblemRequest {
                problem_name: "problemName".to_string(),
                problem_description: ProblemDescription {
                    boards: vec![
                        ProblemDescriptionBoard::Html { value: None },
                        ProblemDescriptionBoard::Html { value: None },
                    ],
                },
                files: HashMap::from([(
                    Language::Java,
                    ProblemFiles {
                        solution_file: FileInfo {
                            filename: "filename".to_string(),
                            contents: "contents".to_string(),
                        },
                        read_only_files: vec![
                            FileInfo {
                                filename: "filename".to_string(),
                                contents: "contents".to_string(),
                            },
                            FileInfo {
                                filename: "filename".to_string(),
                                contents: "contents".to_string(),
                            },
                        ],
                    },
                )]),
                input_params: vec![
                    VariableTypeAndName {
                        variable_type: VariableType::IntegerType,
                        name: "name".to_string(),
                    },
                    VariableTypeAndName {
                        variable_type: VariableType::IntegerType,
                        name: "name".to_string(),
                    },
                ],
                output_type: VariableType::IntegerType,
                testcases: vec![
                    TestCaseWithExpectedResult {
                        test_case: TestCase {
                            id: "id".to_string(),
                            params: vec![
                                VariableValue::IntegerValue { value: None },
                                VariableValue::IntegerValue { value: None },
                            ],
                        },
                        expected_result: VariableValue::IntegerValue { value: None },
                    },
                    TestCaseWithExpectedResult {
                        test_case: TestCase {
                            id: "id".to_string(),
                            params: vec![
                                VariableValue::IntegerValue { value: None },
                                VariableValue::IntegerValue { value: None },
                            ],
                        },
                        expected_result: VariableValue::IntegerValue { value: None },
                    },
                ],
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

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client.rs">delete_problem</a>(problem_id: ProblemId) -> Result<(), ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .problem
        .delete_problem(&ProblemId("problemId".to_string()), None)
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

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client.rs">get_default_starter_files</a>(request: GetDefaultStarterFilesRequest) -> Result<GetDefaultStarterFilesResponse, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .problem
        .get_default_starter_files(
            &GetDefaultStarterFilesRequest {
                input_params: vec![
                    VariableTypeAndName {
                        variable_type: VariableType::IntegerType,
                        name: "name".to_string(),
                    },
                    VariableTypeAndName {
                        variable_type: VariableType::IntegerType,
                        name: "name".to_string(),
                    },
                ],
                output_type: VariableType::IntegerType,
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
<details><summary><code>client.submission.<a href="/src/api/resources/submission/client.rs">create_execution_session</a>(language: Language) -> Result<ExecutionSessionResponse, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .submission
        .create_execution_session(&Language::Java, None)
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

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client.rs">get_execution_session</a>(session_id: String) -> Result<Option<ExecutionSessionResponse>, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .submission
        .get_execution_session(&"sessionId".to_string(), None)
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

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client.rs">stop_execution_session</a>(session_id: String) -> Result<(), ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .submission
        .stop_execution_session(&"sessionId".to_string(), None)
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

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client.rs">get_execution_sessions_state</a>() -> Result<GetExecutionSessionStateResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.submission.get_execution_sessions_state(None).await;
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
<details><summary><code>client.sysprop.<a href="/src/api/resources/sysprop/client.rs">set_num_warm_instances</a>(language: Language, num_warm_instances: i64) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .sysprop
        .set_num_warm_instances(&Language::Java, &1, None)
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

<details><summary><code>client.sysprop.<a href="/src/api/resources/sysprop/client.rs">get_num_warm_instances</a>() -> Result<std::collections::HashMap<Language, i64>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.sysprop.get_num_warm_instances(None).await;
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
<details><summary><code>client.v_2().problem.<a href="/src/api/resources/v_2/problem/client.rs">get_lightweight_problems</a>() -> Result<Vec<LightweightProblemInfoV2>, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.v_2.problem.get_lightweight_problems(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2().problem.<a href="/src/api/resources/v_2/problem/client.rs">get_problems</a>() -> Result<Vec<ProblemInfoV2>, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.v_2.problem.get_problems(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2().problem.<a href="/src/api/resources/v_2/problem/client.rs">get_latest_problem</a>(problem_id: ProblemId) -> Result<ProblemInfoV2, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .v_2
        .problem
        .get_latest_problem(&ProblemId("problemId".to_string()), None)
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

<details><summary><code>client.v_2().problem.<a href="/src/api/resources/v_2/problem/client.rs">get_problem_version</a>(problem_id: ProblemId, problem_version: i64) -> Result<ProblemInfoV2, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .v_2
        .problem
        .get_problem_version(&ProblemId("problemId".to_string()), &1, None)
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

## V2 V3 Problem
<details><summary><code>client.v_2().v_3().problem.<a href="/src/api/resources/v_2/v_3/problem/client.rs">get_lightweight_problems</a>() -> Result<Vec<LightweightProblemInfoV2>, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.v_2.problem.get_lightweight_problems(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2().v_3().problem.<a href="/src/api/resources/v_2/v_3/problem/client.rs">get_problems</a>() -> Result<Vec<ProblemInfoV2>, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.v_2.problem.get_problems(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2().v_3().problem.<a href="/src/api/resources/v_2/v_3/problem/client.rs">get_latest_problem</a>(problem_id: ProblemId) -> Result<ProblemInfoV2, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .v_2
        .problem
        .get_latest_problem(&ProblemId("problemId".to_string()), None)
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

<details><summary><code>client.v_2().v_3().problem.<a href="/src/api/resources/v_2/v_3/problem/client.rs">get_problem_version</a>(problem_id: ProblemId, problem_version: i64) -> Result<ProblemInfoV2, ApiError></code></summary>
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
use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .v_2
        .problem
        .get_problem_version(&ProblemId("problemId".to_string()), &1, None)
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
