# Reference
## Imdb
<details><summary><code>client.Imdb.<a href="/src/SeedApi/Imdb/ImdbClient.cs">CreatemovieAsync</a>(CreateMovieRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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
await client.Imdb.CreatemovieAsync(new CreateMovieRequest { Title = "title", Rating = 1.1 });
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

**request:** `CreateMovieRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Imdb.<a href="/src/SeedApi/Imdb/ImdbClient.cs">GetmovieAsync</a>(ImdbGetMovieRequest { ... }) -> WithRawResponseTask&lt;Movie&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Imdb.GetmovieAsync(new ImdbGetMovieRequest { MovieId = "movieId" });
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

**request:** `ImdbGetMovieRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

