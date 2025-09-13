# Reference
<details><summary><code>client.Echo(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.create_type();
```
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CreateType(request) -> Seed::Types::Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.create_type();
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::Type` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Notification Service
<details><summary><code>client.File.Notification.Service.GetException(NotificationId) -> Seed::Types::Types::Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.file.notification.service.get_exception();
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**notificationId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Service
<details><summary><code>client.File.Service.GetFile(Filename) -> Seed::Types::Types::File</code></summary>
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
client.file.service.get_file({
  filename:'file.txt',
  xFileApiVersion:'0.0.2'
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

**filename:** `String` — This is a filename
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Health Service
<details><summary><code>client.Health.Service.Check(Id) -> </code></summary>
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
client.health.service.check();
```
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Health.Service.Ping() -> Internal::Types::Boolean</code></summary>
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


</dd>
</dl>
</details>

## Service
<details><summary><code>client.Service.GetMovie(MovieId) -> Seed::Types::Types::Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.get_movie();
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**movieId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.CreateMovie(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.create_movie({
  id:'movie-c06a4ad7',
  prequel:'movie-cv9b914f',
  title:'The Boy and the Heron',
  from:'Hayao Miyazaki',
  rating:8,
  type:'movie',
  tag:'tag-wf9as23d',
  metadata:{},
  revenue:1000000
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

**request:** `Seed::Types::Types::Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetMetadata() -> Seed::Types::Types::Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.get_metadata({
  shallow:false,
  xApiVersion:'0.0.1'
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

**xApiVersion:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.CreateBigEntity(request) -> Seed::Types::Types::Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.create_big_entity({
  extendedMovie:{
    cast:['cast', 'cast'],
    id:'id',
    prequel:'prequel',
    title:'title',
    from:'from',
    rating:1.1,
    type:'movie',
    tag:'tag',
    book:'book',
    metadata:{},
    revenue:1000000
  },
  entity:{
    name:'name'
  },
  commonMetadata:{
    id:'id',
    data:{
      data:'data'
    },
    jsonString:'jsonString'
  },
  migration:{
    name:'name'
  },
  node:{
    name:'name',
    nodes:[{
      name:'name',
      nodes:[{
        name:'name',
        nodes:[],
        trees:[]
      }, {
        name:'name',
        nodes:[],
        trees:[]
      }],
      trees:[{
        nodes:[]
      }, {
        nodes:[]
      }]
    }, {
      name:'name',
      nodes:[{
        name:'name',
        nodes:[],
        trees:[]
      }, {
        name:'name',
        nodes:[],
        trees:[]
      }],
      trees:[{
        nodes:[]
      }, {
        nodes:[]
      }]
    }],
    trees:[{
      nodes:[{
        name:'name',
        nodes:[],
        trees:[]
      }, {
        name:'name',
        nodes:[],
        trees:[]
      }]
    }, {
      nodes:[{
        name:'name',
        nodes:[],
        trees:[]
      }, {
        name:'name',
        nodes:[],
        trees:[]
      }]
    }]
  },
  directory:{
    name:'name',
    files:[{
      name:'name',
      contents:'contents'
    }, {
      name:'name',
      contents:'contents'
    }],
    directories:[{
      name:'name',
      files:[{
        name:'name',
        contents:'contents'
      }, {
        name:'name',
        contents:'contents'
      }],
      directories:[{
        name:'name',
        files:[],
        directories:[]
      }, {
        name:'name',
        files:[],
        directories:[]
      }]
    }, {
      name:'name',
      files:[{
        name:'name',
        contents:'contents'
      }, {
        name:'name',
        contents:'contents'
      }],
      directories:[{
        name:'name',
        files:[],
        directories:[]
      }, {
        name:'name',
        files:[],
        directories:[]
      }]
    }]
  },
  moment:{
    id:'d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    date:'2023-01-15',
    datetime:'2024-01-15T09:30:00Z'
  }
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

**request:** `Seed::Types::Types::BigEntity` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.RefreshToken(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.refresh_token();
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::Types::RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
