# Reference
## V2
<details><summary><code>client.v2.<a href="/lib/seed/v2/client.rb">test</a>() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.v2.test
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

**request_options:** `Seed::V2::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">updatetestsubmissionstatus</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.updatetestsubmissionstatus(submission_id: "submissionId")
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::TestSubmissionStatus` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Admin::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">sendtestsubmissionupdate</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.sendtestsubmissionupdate(
  submission_id: "submissionId",
  update_time: "2024-01-15T09:30:00Z",
  update_info: {
    type: "running"
  }
)
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::TestSubmissionUpdate` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Admin::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">updateworkspacesubmissionstatus</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.updateworkspacesubmissionstatus(
  submission_id: "submissionId",
  type: "stopped"
)
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::WorkspaceSubmissionStatus` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Admin::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">sendworkspacesubmissionupdate</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.sendworkspacesubmissionupdate(
  submission_id: "submissionId",
  update_time: "2024-01-15T09:30:00Z",
  update_info: {
    type: "running"
  }
)
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::WorkspaceSubmissionUpdate` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Admin::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">storetracedtestcase</a>(submission_id, test_case_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.storetracedtestcase(
  submission_id: "submissionId",
  test_case_id: "testCaseId",
  result: {
    result: {
      expected_result: {
        type: "integerValue"
      },
      actual_result: {
        type: "value"
      },
      passed: true
    },
    stdout: "stdout"
  },
  trace_responses: [{
    submission_id: "submissionId",
    line_number: 1,
    stack: {
      num_stack_frames: 1
    }
  }]
)
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**test_case_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**result:** `Seed::Types::TestCaseResultWithStdout` 
    
</dd>
</dl>

<dl>
<dd>

**trace_responses:** `Internal::Types::Array[Seed::Types::TraceResponse]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Admin::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">storetracedtestcasev2</a>(submission_id, test_case_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.storetracedtestcasev2(
  submission_id: "submissionId",
  test_case_id: "testCaseId",
  body: [{
    submission_id: "submissionId",
    line_number: 1,
    file: {
      filename: "filename",
      directory: "directory"
    },
    stack: {
      num_stack_frames: 1
    }
  }]
)
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**test_case_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Internal::Types::Array[Seed::Types::TraceResponseV2]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Admin::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">storetracedworkspace</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.storetracedworkspace(
  submission_id: "submissionId",
  workspace_run_details: {
    stdout: "stdout"
  },
  trace_responses: [{
    submission_id: "submissionId",
    line_number: 1,
    stack: {
      num_stack_frames: 1
    }
  }]
)
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**workspace_run_details:** `Seed::Types::WorkspaceRunDetails` 
    
</dd>
</dl>

<dl>
<dd>

**trace_responses:** `Internal::Types::Array[Seed::Types::TraceResponse]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Admin::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">storetracedworkspacev2</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.storetracedworkspacev2(
  submission_id: "submissionId",
  body: [{
    submission_id: "submissionId",
    line_number: 1,
    file: {
      filename: "filename",
      directory: "directory"
    },
    stack: {
      num_stack_frames: 1
    }
  }]
)
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Internal::Types::Array[Seed::Types::TraceResponseV2]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Admin::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>client.homepage.<a href="/lib/seed/homepage/client.rb">gethomepageproblems</a>() -> Internal::Types::Array[String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.homepage.gethomepageproblems
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

**request_options:** `Seed::Homepage::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.<a href="/lib/seed/homepage/client.rb">sethomepageproblems</a>(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.homepage.sethomepageproblems(request: ["string"])
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

**request:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Homepage::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.migration.<a href="/lib/seed/migration/client.rb">getattemptedmigrations</a>() -> Internal::Types::Array[Seed::Types::Migration]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.migration.getattemptedmigrations(admin_key_header: "admin-key-header")
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

**admin_key_header:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Migration::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">createplaylist</a>(service_param, request) -> Seed::Types::Playlist</code></summary>
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

```ruby
client.playlist.createplaylist(
  service_param: 1,
  datetime: "2024-01-15T09:30:00Z",
  name: "name",
  problems: ["problems"]
)
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

**service_param:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_datetime:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::PlaylistCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Playlist::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">getplaylists</a>(service_param) -> Internal::Types::Array[Seed::Types::Playlist]</code></summary>
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

```ruby
client.playlist.getplaylists(
  service_param: 1,
  limit: 1,
  other_field: "otherField",
  multi_line_docs: "multiLineDocs"
)
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

**service_param:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 
    
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

**optional_multiple_field:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**multiple_field:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Playlist::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">getplaylist</a>(service_param, playlist_id) -> Seed::Types::Playlist</code></summary>
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

```ruby
client.playlist.getplaylist(
  service_param: 1,
  playlist_id: "playlistId"
)
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

**service_param:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Playlist::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">updateplaylist</a>(service_param, playlist_id, request) -> Seed::Types::Playlist</code></summary>
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

```ruby
client.playlist.updateplaylist(
  service_param: 1,
  playlist_id: "playlistId",
  name: "name",
  problems: ["problems"]
)
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

**service_param:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problems:** `Internal::Types::Array[String]` — The problems that make up the playlist.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Playlist::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">deleteplaylist</a>(service_param, playlist_id) -> </code></summary>
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

```ruby
client.playlist.deleteplaylist(
  service_param: 1,
  playlist_id: "playlist_id"
)
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

**service_param:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Playlist::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.problem.<a href="/lib/seed/problem/client.rb">createproblem</a>(request) -> Seed::Types::CreateProblemResponse</code></summary>
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

```ruby
client.problem.createproblem(
  problem_name: "problemName",
  problem_description: {
    boards: []
  },
  files: {
    key: {
      solution_file: {
        filename: "filename",
        contents: "contents"
      },
      read_only_files: [{
        filename: "filename",
        contents: "contents"
      }]
    }
  },
  input_params: [{
    variable_type: {
      type: "integerType"
    },
    name: "name"
  }],
  output_type: {
    type: "integerType"
  },
  testcases: [{
    test_case: {
      id: "id",
      params: [{
        type: "integerValue"
      }]
    },
    expected_result: {
      type: "integerValue"
    }
  }],
  method_name: "methodName"
)
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

**request:** `Seed::Types::CreateProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/lib/seed/problem/client.rb">updateproblem</a>(problem_id, request) -> Seed::Types::UpdateProblemResponse</code></summary>
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

```ruby
client.problem.updateproblem(
  problem_id: "problemId",
  problem_name: "problemName",
  problem_description: {
    boards: []
  },
  files: {
    key: {
      solution_file: {
        filename: "filename",
        contents: "contents"
      },
      read_only_files: [{
        filename: "filename",
        contents: "contents"
      }]
    }
  },
  input_params: [{
    variable_type: {
      type: "integerType"
    },
    name: "name"
  }],
  output_type: {
    type: "integerType"
  },
  testcases: [{
    test_case: {
      id: "id",
      params: [{
        type: "integerValue"
      }]
    },
    expected_result: {
      type: "integerValue"
    }
  }],
  method_name: "methodName"
)
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::CreateProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/lib/seed/problem/client.rb">deleteproblem</a>(problem_id) -> </code></summary>
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

```ruby
client.problem.deleteproblem(problem_id: "problemId")
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/lib/seed/problem/client.rb">getdefaultstarterfiles</a>(request) -> Seed::Types::GetDefaultStarterFilesResponse</code></summary>
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

```ruby
client.problem.getdefaultstarterfiles(
  input_params: [{
    variable_type: {
      type: "integerType"
    },
    name: "name"
  }],
  output_type: {
    type: "integerType"
  },
  method_name: "methodName"
)
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

**input_params:** `Internal::Types::Array[Seed::Types::VariableTypeAndName]` 
    
</dd>
</dl>

<dl>
<dd>

**output_type:** `Seed::Types::VariableType` 
    
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

<dl>
<dd>

**request_options:** `Seed::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>client.submission.<a href="/lib/seed/submission/client.rb">createexecutionsession</a>(language) -> Seed::Types::ExecutionSessionResponse</code></summary>
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

```ruby
client.submission.createexecutionsession(language: "JAVA")
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

**language:** `Seed::Types::Language` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Submission::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/lib/seed/submission/client.rb">getexecutionsession</a>(session_id) -> Seed::Types::ExecutionSessionResponse</code></summary>
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

```ruby
client.submission.getexecutionsession(session_id: "sessionId")
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

<dl>
<dd>

**request_options:** `Seed::Submission::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/lib/seed/submission/client.rb">stopexecutionsession</a>(session_id) -> </code></summary>
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

```ruby
client.submission.stopexecutionsession(session_id: "sessionId")
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

<dl>
<dd>

**request_options:** `Seed::Submission::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/lib/seed/submission/client.rb">getexecutionsessionsstate</a>() -> Seed::Types::GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.submission.getexecutionsessionsstate
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

**request_options:** `Seed::Submission::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>client.sysprop.<a href="/lib/seed/sysprop/client.rb">setnumwarminstances</a>(language, num_warm_instances) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.sysprop.setnumwarminstances(
  language: "JAVA",
  num_warm_instances: 1
)
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

**language:** `Seed::Types::Language` 
    
</dd>
</dl>

<dl>
<dd>

**num_warm_instances:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Sysprop::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.sysprop.<a href="/lib/seed/sysprop/client.rb">getnumwarminstances</a>() -> Internal::Types::Hash[String, Integer]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.sysprop.getnumwarminstances
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

**request_options:** `Seed::Sysprop::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2Problem
<details><summary><code>client.v2problem.<a href="/lib/seed/v2problem/client.rb">v2problem_get_lightweight_problems</a>() -> Internal::Types::Array[Seed::Types::V2LightweightProblemInfoV2]</code></summary>
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

```ruby
client.v2problem.v2problem_get_lightweight_problems
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

**request_options:** `Seed::V2Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2problem.<a href="/lib/seed/v2problem/client.rb">v2problem_get_problems</a>() -> Internal::Types::Array[Seed::Types::V2ProblemInfoV2]</code></summary>
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

```ruby
client.v2problem.v2problem_get_problems
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

**request_options:** `Seed::V2Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2problem.<a href="/lib/seed/v2problem/client.rb">v2problem_get_latest_problem</a>(problem_id) -> Seed::Types::V2ProblemInfoV2</code></summary>
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

```ruby
client.v2problem.v2problem_get_latest_problem(problem_id: "problemId")
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::V2Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2problem.<a href="/lib/seed/v2problem/client.rb">v2problem_get_problem_version</a>(problem_id, problem_version) -> Seed::Types::V2ProblemInfoV2</code></summary>
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

```ruby
client.v2problem.v2problem_get_problem_version(
  problem_id: "problemId",
  problem_version: 1
)
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problem_version:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::V2Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2V3Problem
<details><summary><code>client.v2v3problem.<a href="/lib/seed/v2v3problem/client.rb">v2v3problem_get_lightweight_problems</a>() -> Internal::Types::Array[Seed::Types::V2V3LightweightProblemInfoV2]</code></summary>
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

```ruby
client.v2v3problem.v2v3problem_get_lightweight_problems
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

**request_options:** `Seed::V2V3Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2v3problem.<a href="/lib/seed/v2v3problem/client.rb">v2v3problem_get_problems</a>() -> Internal::Types::Array[Seed::Types::V2V3ProblemInfoV2]</code></summary>
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

```ruby
client.v2v3problem.v2v3problem_get_problems
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

**request_options:** `Seed::V2V3Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2v3problem.<a href="/lib/seed/v2v3problem/client.rb">v2v3problem_get_latest_problem</a>(problem_id) -> Seed::Types::V2V3ProblemInfoV2</code></summary>
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

```ruby
client.v2v3problem.v2v3problem_get_latest_problem(problem_id: "problemId")
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::V2V3Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2v3problem.<a href="/lib/seed/v2v3problem/client.rb">v2v3problem_get_problem_version</a>(problem_id, problem_version) -> Seed::Types::V2V3ProblemInfoV2</code></summary>
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

```ruby
client.v2v3problem.v2v3problem_get_problem_version(
  problem_id: "problemId",
  problem_version: 1
)
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problem_version:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::V2V3Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

