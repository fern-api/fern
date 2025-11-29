# Reference
## V2
<details><summary><code>client.v_2.test() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.v_2.test();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>client.admin.update_test_submission_status(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.update_test_submission_status(
  'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',

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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Submission::Types::TestSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.send_test_submission_update(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.send_test_submission_update(
  'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  {
    update_time: '2024-01-15T09:30:00Z'
  }
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Submission::Types::TestSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.update_workspace_submission_status(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.update_workspace_submission_status(
  'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',

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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Submission::Types::WorkspaceSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.send_workspace_submission_update(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.send_workspace_submission_update(
  'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  {
    update_time: '2024-01-15T09:30:00Z'
  }
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Submission::Types::WorkspaceSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.store_traced_test_case(submission_id, test_case_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_test_case(
  submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  test_case_id: 'testCaseId',
  result: {
    result: {
      passed: true
    },
    stdout: 'stdout'
  },
  trace_responses: [{
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    expression_location: {
      start: 1,
      offset: 1
    },
    stack: {
      num_stack_frames: 1,
      top_stack_frame: {
        method_name: 'methodName',
        line_number: 1,
        scopes: [{
          variables: {}
        }, {
          variables: {}
        }]
      }
    },
    stdout: 'stdout'
  }, {
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    expression_location: {
      start: 1,
      offset: 1
    },
    stack: {
      num_stack_frames: 1,
      top_stack_frame: {
        method_name: 'methodName',
        line_number: 1,
        scopes: [{
          variables: {}
        }, {
          variables: {}
        }]
      }
    },
    stdout: 'stdout'
  }]
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

**result:** `Seed::Submission::Types::TestCaseResultWithStdout` 
    
</dd>
</dl>

<dl>
<dd>

**trace_responses:** `Internal::Types::Array[Seed::Submission::Types::TraceResponse]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.store_traced_test_case_v_2(submission_id, test_case_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_test_case_v_2(
  'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  'testCaseId',

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

**request:** `Internal::Types::Array[Seed::Submission::Types::TraceResponseV2]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.store_traced_workspace(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_workspace(
  submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  workspace_run_details: {
    exception: {
      exception_type: 'exceptionType',
      exception_message: 'exceptionMessage',
      exception_stacktrace: 'exceptionStacktrace'
    },
    stdout: 'stdout'
  },
  trace_responses: [{
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    expression_location: {
      start: 1,
      offset: 1
    },
    stack: {
      num_stack_frames: 1,
      top_stack_frame: {
        method_name: 'methodName',
        line_number: 1,
        scopes: [{
          variables: {}
        }, {
          variables: {}
        }]
      }
    },
    stdout: 'stdout'
  }, {
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    expression_location: {
      start: 1,
      offset: 1
    },
    stack: {
      num_stack_frames: 1,
      top_stack_frame: {
        method_name: 'methodName',
        line_number: 1,
        scopes: [{
          variables: {}
        }, {
          variables: {}
        }]
      }
    },
    stdout: 'stdout'
  }]
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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**workspace_run_details:** `Seed::Submission::Types::WorkspaceRunDetails` 
    
</dd>
</dl>

<dl>
<dd>

**trace_responses:** `Internal::Types::Array[Seed::Submission::Types::TraceResponse]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.store_traced_workspace_v_2(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_workspace_v_2(
  'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',

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

**submission_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Internal::Types::Array[Seed::Submission::Types::TraceResponseV2]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>client.homepage.get_homepage_problems() -> Internal::Types::Array[String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.homepage.get_homepage_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.set_homepage_problems(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.homepage.set_homepage_problems();
```
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
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.migration.get_attempted_migrations() -> Internal::Types::Array[Seed::Migration::Types::Migration]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.migration.get_attempted_migrations(admin_key_header: 'admin-key-header');
```
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
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.playlist.create_playlist(service_param, request) -> Seed::Playlist::Types::Playlist</code></summary>
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
client.playlist.create_playlist(
  service_param: 1,
  datetime: '2024-01-15T09:30:00Z',
  optional_datetime: '2024-01-15T09:30:00Z'
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

**request:** `Seed::Playlist::Types::PlaylistCreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.get_playlists(service_param) -> Internal::Types::Array[Seed::Playlist::Types::Playlist]</code></summary>
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
client.playlist.get_playlists(
  service_param: 1,
  limit: 1,
  other_field: 'otherField',
  multi_line_docs: 'multiLineDocs'
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.get_playlist(service_param, playlist_id) -> Seed::Playlist::Types::Playlist</code></summary>
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
client.playlist.get_playlist(
  1,
  'playlistId'
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

**service_param:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.update_playlist(service_param, playlist_id, request) -> Seed::Playlist::Types::Playlist</code></summary>
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
client.playlist.update_playlist(
  1,
  'playlistId',
  {
    name: 'name',
    problems: ['problems', 'problems']
  }
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

**request:** `Seed::Playlist::Types::UpdatePlaylistRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.delete_playlist(service_param, playlist_id) -> </code></summary>
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
client.playlist.delete_playlist(
  1,
  'playlist_id'
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

**service_param:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.problem.create_problem(request) -> Seed::Problem::Types::CreateProblemResponse</code></summary>
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
client.problem.create_problem({
  problem_name: 'problemName',
  problem_description: {
    boards: []
  },
  files: {},
  input_params: [{
    name: 'name'
  }, {
    name: 'name'
  }],
  testcases: [{
    test_case: {
      id: 'id',
      params: []
    }
  }, {
    test_case: {
      id: 'id',
      params: []
    }
  }],
  method_name: 'methodName'
});
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Problem::Types::CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.update_problem(problem_id, request) -> Seed::Problem::Types::UpdateProblemResponse</code></summary>
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
client.problem.update_problem(
  'problemId',
  {
    problem_name: 'problemName',
    problem_description: {
      boards: []
    },
    files: {},
    input_params: [{
      name: 'name'
    }, {
      name: 'name'
    }],
    testcases: [{
      test_case: {
        id: 'id',
        params: []
      }
    }, {
      test_case: {
        id: 'id',
        params: []
      }
    }],
    method_name: 'methodName'
  }
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Problem::Types::CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.delete_problem(problem_id) -> </code></summary>
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
client.problem.delete_problem('problemId');
```
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.get_default_starter_files(request) -> Seed::Problem::Types::GetDefaultStarterFilesResponse</code></summary>
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
client.problem.get_default_starter_files(
  input_params: [{
    name: 'name'
  }, {
    name: 'name'
  }],
  method_name: 'methodName'
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

**input_params:** `Internal::Types::Array[Seed::Problem::Types::VariableTypeAndName]` 
    
</dd>
</dl>

<dl>
<dd>

**output_type:** `Seed::Commons::Types::VariableType` 
    
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
<details><summary><code>client.submission.create_execution_session(language) -> Seed::Submission::Types::ExecutionSessionResponse</code></summary>
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
client.submission.create_execution_session();
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**language:** `Seed::Commons::Types::Language` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.get_execution_session(session_id) -> Seed::Submission::Types::ExecutionSessionResponse</code></summary>
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
client.submission.get_execution_session('sessionId');
```
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

<details><summary><code>client.submission.stop_execution_session(session_id) -> </code></summary>
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
client.submission.stop_execution_session('sessionId');
```
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

<details><summary><code>client.submission.get_execution_sessions_state() -> Seed::Submission::Types::GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.submission.get_execution_sessions_state();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>client.sysprop.set_num_warm_instances(language, num_warm_instances) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.sysprop.set_num_warm_instances(
  ,
  1
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

**language:** `Seed::Commons::Types::Language` 
    
</dd>
</dl>

<dl>
<dd>

**num_warm_instances:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.sysprop.get_num_warm_instances() -> Internal::Types::Hash[Seed::Commons::Types::Language, Integer]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.sysprop.get_num_warm_instances();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 Problem
<details><summary><code>client.v_2.problem.get_lightweight_problems() -> Internal::Types::Array[Seed::V2::Problem::Types::LightweightProblemInfoV2]</code></summary>
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
client.v_2.problem.get_lightweight_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.problem.get_problems() -> Internal::Types::Array[Seed::V2::Problem::Types::ProblemInfoV2]</code></summary>
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
client.v_2.problem.get_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.problem.get_latest_problem(problem_id) -> Seed::V2::Problem::Types::ProblemInfoV2</code></summary>
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
client.v_2.problem.get_latest_problem('problemId');
```
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.problem.get_problem_version(problem_id, problem_version) -> Seed::V2::Problem::Types::ProblemInfoV2</code></summary>
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
client.v_2.problem.get_problem_version(
  'problemId',
  1
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problem_version:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 V3 Problem
<details><summary><code>client.v_2.v_3.problem.get_lightweight_problems() -> Internal::Types::Array[Seed::V2::V3::Problem::Types::LightweightProblemInfoV2]</code></summary>
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
client.v_2.problem.get_lightweight_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.v_3.problem.get_problems() -> Internal::Types::Array[Seed::V2::V3::Problem::Types::ProblemInfoV2]</code></summary>
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
client.v_2.problem.get_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.v_3.problem.get_latest_problem(problem_id) -> Seed::V2::V3::Problem::Types::ProblemInfoV2</code></summary>
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
client.v_2.problem.get_latest_problem('problemId');
```
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.v_3.problem.get_problem_version(problem_id, problem_version) -> Seed::V2::V3::Problem::Types::ProblemInfoV2</code></summary>
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
client.v_2.problem.get_problem_version(
  'problemId',
  1
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problem_version:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
