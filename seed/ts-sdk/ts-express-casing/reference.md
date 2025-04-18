# Reference

## Imdb

<details><summary><code>client.imdb.<a href="/src/api/resources/imdb/client/Client.ts">createMovie</a>({ ...params }) -> SeedApi.MovieId</code></summary>
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

```typescript
await client.imdb.createMovie({
    id: "id",
    movieTitle: "movie_title",
    movieRating: 1.1,
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

**requestOptions:** `Imdb.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.imdb.<a href="/src/api/resources/imdb/client/Client.ts">getMovie</a>(movieId) -> SeedApi.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.imdb.getMovie("movie_id");
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

**movieId:** `SeedApi.MovieId`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Imdb.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
