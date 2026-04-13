# Reference
## Imdb
<details><summary><code>client.imdb.<a href="/src/api/resources/imdb/client/Client.ts">createmovie</a>({ ...params }) -> SeedApi.MovieId</code></summary>
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

```typescript
await client.imdb.createmovie({
    title: "title",
    rating: 1.1
});

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

<dl>
<dd>

**requestOptions:** `ImdbClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.imdb.<a href="/src/api/resources/imdb/client/Client.ts">getmovie</a>({ ...params }) -> SeedApi.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.imdb.getmovie({
    movieId: SeedApi.MovieId("movieId")
});

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

**request:** `SeedApi.ImdbGetMovieRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ImdbClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

