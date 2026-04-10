# Reference
## Imdb
<details><summary><code>client.Imdb.CreateMovie(request) -> please.MovieID</code></summary>
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

```go
request := &please.CreateMovieRequest{
        Title: "title",
        Rating: 1.1,
    }
client.Imdb.CreateMovie(
        context.TODO(),
        request,
    )
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

**request:** `*please.CreateMovieRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Imdb.GetMovie(MovieID) -> *please.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Imdb.GetMovie(
        context.TODO(),
        "movieId",
    )
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

**movieID:** `please.MovieID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

