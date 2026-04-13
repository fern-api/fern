# Reference
## Imdb
<details><summary><code>client.Imdb.Createmovie(request) -> inhereplease.MovieID</code></summary>
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

<details><summary><code>client.Imdb.Getmovie(MovieID) -> *inhereplease.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &inhereplease.ImdbGetMovieRequest{
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

**movieID:** `inhereplease.MovieID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

