# Reference
## Imdb
<details><summary><code>$client-><a href="/Custom/Package/Path/Imdb/ImdbClient.php">createMovie</a>($request) -> string</code></summary>
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
    $request,
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

**$request:** `\Custom\Package\Path\Imdb\Types\CreateMovieRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Custom/Package/Path/Imdb/ImdbClient.php">getMovie</a>($$movieId) -> \Custom\Package\Path\Imdb\Types\Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->imdb->getMovie(
    movieId: $movieId,
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

**$movieId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
