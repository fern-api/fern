# Reference
## Imdb
<details><summary><code>client.imdb.createmovie(request) -> String</code></summary>
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

```java
client.imdb().createmovie(
    CreateMovieRequest
        .builder()
        .title("title")
        .rating(1.1)
        .build()
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

**title:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**rating:** `Double` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.imdb.getmovie(movieId) -> Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.imdb().getmovie(
    "movieId",
    ImdbGetMovieRequest
        .builder()
        .build()
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

**movieId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

