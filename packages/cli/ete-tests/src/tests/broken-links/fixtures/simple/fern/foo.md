# foo.mdx

## Valid Links

1. valid page link [/api-reference/imdb/create-movie](/api-reference/imdb/create-movie)
2. valid relative file link [./bar.mdx](./bar.mdx)
3. valid relative link with [anchor](./#subsection-title)

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

## Card Links

<Card title="Valid Card" href="/api-reference/imdb/create-movie">
  This card links to a valid page
</Card>

<Card title="Broken Card" href="/nonexistent/card-page">
  This card links to a broken page
</Card>

<CardGroup cols={2}>
  <Card title="Valid Group Card" href="/section/bar">
    Valid link in card group
  </Card>
  <Card title="Broken Group Card" href="/bad/group-link">
    Broken link in card group
  </Card>
</CardGroup>
