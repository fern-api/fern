# foo.mdx

## Valid Links

1. valid page link [/api-reference/imdb/create-movie](/api-reference/imdb/create-movie)
2. valid relative file link [./bar.mdx](./bar.mdx)
3. valid relative link with [anchor](./#subsection-title)
4. external link with angle brackets [here](<https://conduitxyz.typeform.com/to/VY5a5URt?typeform-source=docs.conduit.xyz>)

## Broken Links

1. broken page link [/bar/baz](/bar/baz)
2. broken file link [/bar/baz.md](/bar/baz.md)


## Code Block

```
// broken links in code blocks should not be flagged
[link](/bar/baz)
```

## Special Files

1. link to llms.txt file [llms.txt](/llms.txt)
