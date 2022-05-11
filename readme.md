# Fern

</p>

Fern was developed as an open-source alternative to OpenAPI and is currently in beta.

Define your API in YAML and Fern will generate type-safe clients for Java and TypeScript.

## Example

The YAML defines a simple Blog Post API.

```yaml
ids:
    - PostId

types:
    Post:
        docs: A blog post
        properties:
            id: PostId
            type: PostType
            title: string
            author: Author
            content: string

    PostType:
        enum:
            - LONG
            - SHORT

    Author:
        union:
            anonymous: {}
            name: string

    CreatePostRequest:
        properties:
            title: string
            author: Author
            content: string

errors:
    PostNotFoundError:
        http:
            statusCode: 404
        properties:
            id: PostId

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
                    errors:
                        union:
                            notFound: PostNotFoundError
```

## Contributing

The team welcomes contributions! To make code changes to one of the Fern repos:

-   Fork the repo and make a branch
-   Write your code
-   Open a PR (optionally linking to a Github issue)

## License

This tooling is made available under the [MIT License](LICENSE).
