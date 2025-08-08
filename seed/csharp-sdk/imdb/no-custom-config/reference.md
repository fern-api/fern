# Reference
## Imdb
<details><summary><code>client.Imdb.<a href="/src/SeedApi/Imdb/ImdbClient.cs">CreateMovieAsync</a>(SeedApi.CreateMovieRequest { ... }) -> string</code></summary>
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

```csharp
await client.Imdb.CreateMovieAsync(
    new SeedApi.CreateMovieRequest { Title = "title", Rating = 1.1 }
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

**request:** `SeedApi.CreateMovieRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Imdb.<a href="/src/SeedApi/Imdb/ImdbClient.cs">GetMovieAsync</a>(movieId) -> SeedApi.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Imdb.GetMovieAsync("movieId");
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

**movieId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
