# Reference
## Imdb
<details><summary><code>client.Imdb.Createmovie(request) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a movie to the database
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
request := &fern.CreateMovieRequest{
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

