# Reference
## Imdb
<details><summary><code>client.Imdb.CreateMovie(request) -> inhereplease.MovieID</code></summary>
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
request := &inhereplease.CreateMovieRequest{
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

**request:** `*inhereplease.CreateMovieRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Imdb.GetMovie(MovieID) -> *inhereplease.Movie</code></summary>
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

**movieID:** `inhereplease.MovieID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

