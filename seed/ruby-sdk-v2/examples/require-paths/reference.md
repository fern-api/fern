# Reference
<details><summary><code>client.<a href="/lib/seed/client.rb">echo</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.echo(request: 'Hello world!\n\nwith\n\tnewlines');
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">create_type</a>(request) -> FernExamples::Types::Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.echo(request: 'primitive');
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `FernExamples::Types::Type` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Notification Service
<details><summary><code>client.file.notification.service.<a href="/lib/seed/file/notification/service/client.rb">get_exception</a>(notification_id) -> FernExamples::Types::Types::Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.file.notification.service.get_exception(notification_id: 'notification-hsy129x');
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**notification_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::File::Notification::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Service
<details><summary><code>client.file.service.<a href="/lib/seed/file/service/client.rb">get_file</a>(filename) -> FernExamples::Types::Types::File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint returns a file by its name.
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
client.file.service.get_file(
  filename: 'file.txt',
  x_file_api_version: '0.0.2'
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

**filename:** `String` — This is a filename
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::File::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Health Service
<details><summary><code>client.health.service.<a href="/lib/seed/health/service/client.rb">check</a>(id) -> </code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of a resource.
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
client.health.service.check(id: 'id-2sdx82h');
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `String` — The id to check
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::Health::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.health.service.<a href="/lib/seed/health/service/client.rb">ping</a>() -> Internal::Types::Boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of the service.
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
client.health.service.ping();
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `FernExamples::Health::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">get_movie</a>(movie_id) -> FernExamples::Types::Types::Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.get_movie(movie_id: 'movie-c06a4ad7');
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**movie_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">create_movie</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.create_movie(
  id: 'movie-c06a4ad7',
  prequel: 'movie-cv9b914f',
  title: 'The Boy and the Heron',
  from: 'Hayao Miyazaki',
  rating: 8,
  type: 'movie',
  tag: 'tag-wf9as23d',
  metadata: {},
  revenue: 1000000
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

**request:** `FernExamples::Types::Types::Movie` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">get_metadata</a>() -> FernExamples::Types::Types::Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.get_metadata(
  shallow: false,
  x_api_version: '0.0.1'
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

**shallow:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**tag:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**x_api_version:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">create_big_entity</a>(request) -> FernExamples::Types::Types::Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.create_big_entity(
  cast_member: {
    name: 'name',
    id: 'id'
  },
  extended_movie: {
    cast: ['cast', 'cast'],
    id: 'id',
    prequel: 'prequel',
    title: 'title',
    from: 'from',
    rating: 1.1,
    type: 'movie',
    tag: 'tag',
    book: 'book',
    metadata: {},
    revenue: 1000000
  },
  entity: {
    type: 'primitive',
    name: 'name'
  },
  metadata: {},
  common_metadata: {
    id: 'id',
    data: {
      data: 'data'
    },
    json_string: 'jsonString'
  },
  data: {},
  migration: {
    name: 'name',
    status: 'RUNNING'
  },
  test: {},
  node: {
    name: 'name',
    nodes: [{
      name: 'name',
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }],
      trees: [{
        nodes: []
      }, {
        nodes: []
      }]
    }, {
      name: 'name',
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }],
      trees: [{
        nodes: []
      }, {
        nodes: []
      }]
    }],
    trees: [{
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }]
    }, {
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }]
    }]
  },
  directory: {
    name: 'name',
    files: [{
      name: 'name',
      contents: 'contents'
    }, {
      name: 'name',
      contents: 'contents'
    }],
    directories: [{
      name: 'name',
      files: [{
        name: 'name',
        contents: 'contents'
      }, {
        name: 'name',
        contents: 'contents'
      }],
      directories: [{
        name: 'name',
        files: [],
        directories: []
      }, {
        name: 'name',
        files: [],
        directories: []
      }]
    }, {
      name: 'name',
      files: [{
        name: 'name',
        contents: 'contents'
      }, {
        name: 'name',
        contents: 'contents'
      }],
      directories: [{
        name: 'name',
        files: [],
        directories: []
      }, {
        name: 'name',
        files: [],
        directories: []
      }]
    }]
  },
  moment: {
    id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    date: '2023-01-15',
    datetime: '2024-01-15T09:30:00Z'
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

**request:** `FernExamples::Types::Types::BigEntity` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">refresh_token</a>(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.refresh_token(request: {
  ttl: 420
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

**request:** `FernExamples::Types::Types::RefreshTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernExamples::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
