# Model

</p>

The _Fern model_ describes the data model used to defining your APIs in Fern.

## Core Concepts

-   [imports](#imports)
-   [ids](#ids)
-   [types](#types)
-   [errors](#errors)
-   [services](#services)

### Imports

_Reference Core Concepts from other Fern models._

```yml
import:
    blog: blog.yml
    user: user.yml
```

### Ids

_Identifiers are named and default to string._

```yml
ids:
    blog: BlogPostId
    user: UserId
    publication: PublicationId
```

### Types

_Users may define the following kinds of types. These can be referenced by their name elsewhere in a Fern data model._

-   [Primitives](#Primitives)
-   [Objects](#Objects)
-   [Aliases](#Aliases)
-   [Enums](#Enums)
-   [Containers](#Containers)

### Errors

_Users may define a name and structure for errors so that clients can expect specific pieces of information on failure._

_Structured errors_ have the following properties:

-   _Name_ - a user chosen description e.g. `BlogNotFoundError`
-   _Status code_ - an optional HTTP status code e.g. `404`

```yml
errors:
    BlogNotFoundError:
        http:
            statusCode: 404
    UserInvalidError:
        http:
            statusCode: 400
```

### Services

_HTTP endpoints that support `GET`, `PUT`, `POST`, `DELETE`_

```yml
services:
  http:
    PostsService:
      base-path: /posts
      endpoints:
        getPost:
          method: GET
          path: /{postId}
          parameters:
            postId: string
          request: CreatePostRequest
          response: PostId
        publishPost:
          method: POST
          path: /publish
          request: PublishPostRequest
          response: PublishPostResponse
        deletePost:
          method: DELETE
         path: /{postId}
          parameters:
            postId: string
```

### Primitives

_Types that are built-in to the Fern data model._

```yml
types:
    Primitives:
        properties:
            a: any # a catch-all type
            b: boolean
            c: double
            d: integer
            e: long
            f: string
```

<br>

### Objects

_A collection of named properties, each of which has their own Fern type. Below is an example of a `Post` object._

```yml
types:
    Post:
        docs: A blog post
        properties:
            id: PostId
            type: PostType
            title: string
            author: Author
            content: string
    Podcast:
        docs: An audio version of a blog post
        extends: Post
        properties:
            duration: integer
            coverArt: string
```

### Aliases

_A new name for an existing type to make a user's types more self-documenting._

```yml
types:
    PostType:
        properties:
            length: PostLength
```

### Unions

_A tagged union data structure that can take on several different, but fixed, types._

```yml
types:
    Author:
        union:
            anonymous: {}
            name: string
```

### Enums

_A type consisting of named string variants._

```yml
types:
    BlogStatus:
        enum:
            - DRAFT
            - PUBLISHED
            - ARCHIVED
```

### Containers

-   `list<T>` - an ordered sequence of items of type `T`.
-   `map<K, V>` - values of type `V` each indexed by a unique key of type `K` (keys are unordered).
-   `optional<T>` - represents a value of type `T` which is either present or not present.
-   `set<T>` - a collection of distinct values of type `T`.
