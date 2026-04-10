# Reference
## Imdb
<details><summary><code>client.Imdb.Createmovie(request) -> please.MovieID</code></summary>
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
client.Imdb.Createmovie(
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

**title:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**rating:** `float64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Imdb.Getmovie(MovieID) -> *please.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &please.ImdbGetMovieRequest{
        MovieID: "movieId",
    }
client.Imdb.Getmovie(
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

**movieID:** `please.MovieID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

