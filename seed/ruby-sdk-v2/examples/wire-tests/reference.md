# Reference
## 
<details><summary><code>client..<a href="/lib/seed/client.rb">echo</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client..echo(request: "string")
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

**request_options:** `Seed::::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client..<a href="/lib/seed/client.rb">create_type</a>(request) -> Seed::Types::Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client..create_type(request: "primitive")
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

<dl>
<dd>

**request_options:** `Seed::::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileNotificationService
<details><summary><code>client.file_notification_service.<a href="/lib/seed/file_notification_service/client.rb">file_notification_service_get_exception</a>(notification_id) -> Seed::Types::Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.file_notification_service.file_notification_service_get_exception(notification_id: "notificationId")
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

**request_options:** `Seed::FileNotificationService::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileService
<details><summary><code>client.file_service.<a href="/lib/seed/file_service/client.rb">file_service_get_file</a>(filename) -> Seed::Types::File</code></summary>
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
client.file_service.file_service_get_file(filename: "filename")
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

**request_options:** `Seed::FileService::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## HealthService
<details><summary><code>client.health_service.<a href="/lib/seed/health_service/client.rb">health_service_check</a>(id) -> </code></summary>
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
client.health_service.health_service_check(id: "id")
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

**request_options:** `Seed::HealthService::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.health_service.<a href="/lib/seed/health_service/client.rb">health_service_ping</a>() -> Internal::Types::Boolean</code></summary>
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
client.health_service.health_service_ping
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

**request_options:** `Seed::HealthService::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">getmovie</a>(movie_id) -> Seed::Types::Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.getmovie(movie_id: "movieId")
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

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">createmovie</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.createmovie(
  id: "id",
  title: "title",
  from: "from",
  rating: 1.1,
  type: "movie",
  tag: "tag",
  metadata: {},
  revenue: 1000000
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

**request:** `Seed::Types::Movie` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">getmetadata</a>() -> Seed::Types::Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.getmetadata(api_version: "X-API-Version")
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

**api_version:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">createbigentity</a>(request) -> Seed::Types::Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.createbigentity
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

**cast_member:** `Seed::Types::CastMember` 
    
</dd>
</dl>

<dl>
<dd>

**extended_movie:** `Seed::Types::ExtendedMovie` 
    
</dd>
</dl>

<dl>
<dd>

**entity:** `Seed::Types::Entity` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Seed::Types::Metadata` 
    
</dd>
</dl>

<dl>
<dd>

**common_metadata:** `Seed::Types::CommonsMetadata` 
    
</dd>
</dl>

<dl>
<dd>

**event_info:** `Seed::Types::CommonsEventInfo` 
    
</dd>
</dl>

<dl>
<dd>

**data:** `Seed::Types::CommonsData` 
    
</dd>
</dl>

<dl>
<dd>

**migration:** `Seed::Types::Migration` 
    
</dd>
</dl>

<dl>
<dd>

**exception:** `Seed::Types::Exception` 
    
</dd>
</dl>

<dl>
<dd>

**test:** `Seed::Types::Test` 
    
</dd>
</dl>

<dl>
<dd>

**node:** `Seed::Types::Node` 
    
</dd>
</dl>

<dl>
<dd>

**directory:** `Seed::Types::Directory` 
    
</dd>
</dl>

<dl>
<dd>

**moment:** `Seed::Types::Moment` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">refreshtoken</a>(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.refreshtoken(ttl: 1)
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

**ttl:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

