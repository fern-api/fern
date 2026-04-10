# Reference
## Imdb
<details><summary><code>client.imdb.<a href="/lib/seed/imdb/client.rb">createmovie</a>(request) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a movie to the database using the movies/* /... path.
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
client.imdb.createmovie(
  title: "title",
  rating: 1.1
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

**title:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**rating:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Imdb::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.imdb.<a href="/lib/seed/imdb/client.rb">getmovie</a>(movie_id) -> Seed::Types::Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.imdb.getmovie(movie_id: "movieId")
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

**request_options:** `Seed::Imdb::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

