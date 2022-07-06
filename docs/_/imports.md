# Imports

Imports allow you to reference types, errors, and ids from other Fern API Definitions.

## Example of using imports

Let's say that we've got a `movies.yml` where we've already defined a `MovieId`.

```yml
# movies.yml

ids:
  - MovieId
```

We now want to create a new file called `actors.yml` that includes every movie an Actor has had a role in. We don't want to redefine `MovieId`, instead we want to reference what we already defined above. We can accomplish this by using an import.

```yml
# actors.yml

imports:
  movies: movies.yml

ids:
  - ActorId

types:
  Actor:
    properties:
      id: ActorId
      name: string
      movies: list<movies.MovieId>
```

In the last line above, `movies.` informs which import to reference and `MovieId` is the id that we're referencing. While this example shows importing an id from another file, you can also import types and errors.
