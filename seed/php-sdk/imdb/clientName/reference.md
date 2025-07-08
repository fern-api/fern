# Reference
## Imdb
<details><summary><code>$client-><a href="/Seed/Imdb/ImdbClient.php">createMovie</a>($request) -> string</code></summary>
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

```php
$client->imdb->createMovie(
    $request, // Request object
);

// $response is of type: string
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

**$request:** `\Seed\Imdb\Types\CreateMovieRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Imdb/ImdbClient.php">getMovie</a>($$movieId) -> \Seed\Imdb\Types\Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->imdb->getMovie(
    movieId: 'param', // string
);

// $response is of type: \Seed\Imdb\Types\Movie
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

**$movieId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
