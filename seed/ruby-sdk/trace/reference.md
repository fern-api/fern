# Reference
## V2
<details><summary><code>client.v_2.<a href="/lib/seed/v_2/client.rb">test</a>() -> </code></summary>
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
<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">update_test_submission_status</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.update_test_submission_status(
  submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  request: {}
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

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">send_test_submission_update</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.send_test_submission_update(
  submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  update_time: '2024-01-15T09:30:00Z',
  update_info: {}
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

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">update_workspace_submission_status</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.update_workspace_submission_status(
  submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  request: {}
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

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">send_workspace_submission_update</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.send_workspace_submission_update(
  submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  update_time: '2024-01-15T09:30:00Z',
  update_info: {}
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

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">store_traced_test_case</a>(submission_id, test_case_id, request) -> </code></summary>
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
      expected_result: {},
      actual_result: {
        value: {}
      },
      passed: true
    },
    stdout: 'stdout'
  },
  trace_responses: [{
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    return_value: {},
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
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
        }]
      }
    },
    stdout: 'stdout'
  }, {
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    return_value: {},
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
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
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

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">store_traced_test_case_v_2</a>(submission_id, test_case_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_test_case_v_2(
  submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  test_case_id: 'testCaseId',
  request: [{
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    file: {
      filename: 'filename',
      directory: 'directory'
    },
    return_value: {},
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
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
        }]
      }
    },
    stdout: 'stdout'
  }, {
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    file: {
      filename: 'filename',
      directory: 'directory'
    },
    return_value: {},
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
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
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

**request:** `Internal::Types::Array[Seed::Submission::Types::TraceResponseV2]` 
    
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

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">store_traced_workspace</a>(submission_id, request) -> </code></summary>
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
    return_value: {},
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
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
        }]
      }
    },
    stdout: 'stdout'
  }, {
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    return_value: {},
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
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
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

<details><summary><code>client.admin.<a href="/lib/seed/admin/client.rb">store_traced_workspace_v_2</a>(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_workspace_v_2(
  submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  request: [{
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    file: {
      filename: 'filename',
      directory: 'directory'
    },
    return_value: {},
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
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
        }]
      }
    },
    stdout: 'stdout'
  }, {
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    file: {
      filename: 'filename',
      directory: 'directory'
    },
    return_value: {},
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
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
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

**request:** `Internal::Types::Array[Seed::Submission::Types::TraceResponseV2]` 
    
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
<details><summary><code>client.homepage.<a href="/lib/seed/homepage/client.rb">get_homepage_problems</a>() -> Internal::Types::Array[String]</code></summary>
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

<details><summary><code>client.homepage.<a href="/lib/seed/homepage/client.rb">set_homepage_problems</a>(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.homepage.set_homepage_problems(request: ['string', 'string']);
```
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
<details><summary><code>client.migration.<a href="/lib/seed/migration/client.rb">get_attempted_migrations</a>() -> Internal::Types::Array[Seed::Migration::Types::Migration]</code></summary>
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
<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">create_playlist</a>(service_param, request) -> Seed::Playlist::Types::Playlist</code></summary>
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
  optional_datetime: '2024-01-15T09:30:00Z',
  name: 'name',
  problems: ['problems', 'problems']
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

<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">get_playlists</a>(service_param) -> Internal::Types::Array[Seed::Playlist::Types::Playlist]</code></summary>
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

<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">get_playlist</a>(service_param, playlist_id) -> Seed::Playlist::Types::Playlist</code></summary>
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
  service_param: 1,
  playlist_id: 'playlistId'
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

**request_options:** `Seed::Playlist::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">update_playlist</a>(service_param, playlist_id, request) -> Seed::Playlist::Types::Playlist</code></summary>
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
  service_param: 1,
  playlist_id: 'playlistId',
  request: {
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

<details><summary><code>client.playlist.<a href="/lib/seed/playlist/client.rb">delete_playlist</a>(service_param, playlist_id) -> </code></summary>
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
  service_param: 1,
  playlist_id: 'playlist_id'
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

**request_options:** `Seed::Playlist::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.problem.<a href="/lib/seed/problem/client.rb">create_problem</a>(request) -> Seed::Problem::Types::CreateProblemResponse</code></summary>
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
client.problem.create_problem(
  problem_name: 'problemName',
  problem_description: {
    boards: [{}, {}]
  },
  files: {
    JAVA: {
      solution_file: {
        filename: 'filename',
        contents: 'contents'
      },
      read_only_files: [{
        filename: 'filename',
        contents: 'contents'
      }, {
        filename: 'filename',
        contents: 'contents'
      }]
    }
  },
  input_params: [{
    variable_type: {},
    name: 'name'
  }, {
    variable_type: {},
    name: 'name'
  }],
  output_type: {},
  testcases: [{
    test_case: {
      id: 'id',
      params: [{}, {}]
    },
    expected_result: {}
  }, {
    test_case: {
      id: 'id',
      params: [{}, {}]
    },
    expected_result: {}
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

**request:** `Seed::Problem::Types::CreateProblemRequest` 
    
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

<details><summary><code>client.problem.<a href="/lib/seed/problem/client.rb">update_problem</a>(problem_id, request) -> Seed::Problem::Types::UpdateProblemResponse</code></summary>
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
  problem_id: 'problemId',
  problem_name: 'problemName',
  problem_description: {
    boards: [{}, {}]
  },
  files: {
    JAVA: {
      solution_file: {
        filename: 'filename',
        contents: 'contents'
      },
      read_only_files: [{
        filename: 'filename',
        contents: 'contents'
      }, {
        filename: 'filename',
        contents: 'contents'
      }]
    }
  },
  input_params: [{
    variable_type: {},
    name: 'name'
  }, {
    variable_type: {},
    name: 'name'
  }],
  output_type: {},
  testcases: [{
    test_case: {
      id: 'id',
      params: [{}, {}]
    },
    expected_result: {}
  }, {
    test_case: {
      id: 'id',
      params: [{}, {}]
    },
    expected_result: {}
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

**problem_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Problem::Types::CreateProblemRequest` 
    
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

<details><summary><code>client.problem.<a href="/lib/seed/problem/client.rb">delete_problem</a>(problem_id) -> </code></summary>
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
client.problem.delete_problem(problem_id: 'problemId');
```
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

<details><summary><code>client.problem.<a href="/lib/seed/problem/client.rb">get_default_starter_files</a>(request) -> Seed::Problem::Types::GetDefaultStarterFilesResponse</code></summary>
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
    variable_type: {},
    name: 'name'
  }, {
    variable_type: {},
    name: 'name'
  }],
  output_type: {},
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
<details><summary><code>client.submission.<a href="/lib/seed/submission/client.rb">create_execution_session</a>(language) -> Seed::Submission::Types::ExecutionSessionResponse</code></summary>
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
client.submission.create_execution_session(language: 'JAVA');
```
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

**request_options:** `Seed::Submission::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/lib/seed/submission/client.rb">get_execution_session</a>(session_id) -> Seed::Submission::Types::ExecutionSessionResponse</code></summary>
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
client.submission.get_execution_session(session_id: 'sessionId');
```
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

<details><summary><code>client.submission.<a href="/lib/seed/submission/client.rb">stop_execution_session</a>(session_id) -> </code></summary>
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
client.submission.stop_execution_session(session_id: 'sessionId');
```
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

<details><summary><code>client.submission.<a href="/lib/seed/submission/client.rb">get_execution_sessions_state</a>() -> Seed::Submission::Types::GetExecutionSessionStateResponse</code></summary>
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
<details><summary><code>client.sysprop.<a href="/lib/seed/sysprop/client.rb">set_num_warm_instances</a>(language, num_warm_instances) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.sysprop.set_num_warm_instances(
  language: 'JAVA',
  num_warm_instances: 1
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

<details><summary><code>client.sysprop.<a href="/lib/seed/sysprop/client.rb">get_num_warm_instances</a>() -> Internal::Types::Hash[Seed::Commons::Types::Language, Integer]</code></summary>
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

## V2 Problem
<details><summary><code>client.v_2.problem.<a href="/lib/seed/v_2/problem/client.rb">get_lightweight_problems</a>() -> Internal::Types::Array[Seed::V2::Problem::Types::LightweightProblemInfoV2]</code></summary>
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

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `Seed::V2::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.problem.<a href="/lib/seed/v_2/problem/client.rb">get_problems</a>() -> Internal::Types::Array[Seed::V2::Problem::Types::ProblemInfoV2]</code></summary>
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

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `Seed::V2::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.problem.<a href="/lib/seed/v_2/problem/client.rb">get_latest_problem</a>(problem_id) -> Seed::V2::Problem::Types::ProblemInfoV2</code></summary>
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
client.v_2.problem.get_latest_problem(problem_id: 'problemId');
```
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

**request_options:** `Seed::V2::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.problem.<a href="/lib/seed/v_2/problem/client.rb">get_problem_version</a>(problem_id, problem_version) -> Seed::V2::Problem::Types::ProblemInfoV2</code></summary>
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
  problem_id: 'problemId',
  problem_version: 1
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

<dl>
<dd>

**request_options:** `Seed::V2::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 V3 Problem
<details><summary><code>client.v_2.v_3.problem.<a href="/lib/seed/v_2/v_3/problem/client.rb">get_lightweight_problems</a>() -> Internal::Types::Array[Seed::V2::V3::Problem::Types::LightweightProblemInfoV2]</code></summary>
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

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `Seed::V2::V3::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.v_3.problem.<a href="/lib/seed/v_2/v_3/problem/client.rb">get_problems</a>() -> Internal::Types::Array[Seed::V2::V3::Problem::Types::ProblemInfoV2]</code></summary>
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

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `Seed::V2::V3::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.v_3.problem.<a href="/lib/seed/v_2/v_3/problem/client.rb">get_latest_problem</a>(problem_id) -> Seed::V2::V3::Problem::Types::ProblemInfoV2</code></summary>
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
client.v_2.problem.get_latest_problem(problem_id: 'problemId');
```
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

**request_options:** `Seed::V2::V3::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.v_3.problem.<a href="/lib/seed/v_2/v_3/problem/client.rb">get_problem_version</a>(problem_id, problem_version) -> Seed::V2::V3::Problem::Types::ProblemInfoV2</code></summary>
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
  problem_id: 'problemId',
  problem_version: 1
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

<dl>
<dd>

**request_options:** `Seed::V2::V3::Problem::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
