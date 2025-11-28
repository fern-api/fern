# Fern Documentation Components Reference

This file contains examples of all available Fern documentation components that can be used to enhance markdown content.

## Code Blocks

### Basic Code Block
```typescript
import { PlantClient } from "@plantstore/sdk";

const client = new PlantClient({ apiKey: "YOUR_API_KEY" });
const plant = await client.plants.create({
  name: "Monstera",
  species: "Monstera deliciosa"
});
```

### Code Block with Title
```python title="Create a plant"
from plantstore import PlantClient

client = PlantClient(api_key="YOUR_API_KEY")
plant = client.plants.create(
    name="Monstera",
    species="Monstera deliciosa"
)
```

### Code Block with Line Highlighting
```javascript {2-4}
console.log("Line 1");
console.log("Line 2 - highlighted");
console.log("Line 3 - highlighted");
console.log("Line 4 - highlighted");
console.log("Line 5");
```

### Code Blocks with Tabs (Multiple Languages)
<CodeBlocks>
  ```python title="Python"
  print("Hello World")
  ```

  ```typescript title="TypeScript"
  console.log("Hello World");
  ```

  ```go title="Go"
  fmt.Println("Hello World")
  ```
</CodeBlocks>

### Code Block with Deep Links
<CodeBlock
  links={{"PlantClient": "/api-reference/client", "createPlant": "/api-reference/plants#create"}}
>
```typescript
import { PlantClient } from "@plantstore/sdk";

const client = new PlantClient({ apiKey: "YOUR_API_KEY" });
const plant = await client.createPlant({
  name: "Monstera"
});
```
</CodeBlock>

## Steps

Use steps for sequential instructions, tutorials, or walkthroughs:

<Steps>
  <Step title="Install the SDK">
    First, install the Plants API SDK using your package manager.
    
    ```bash
    npm install @plantstore/sdk
    ```
  </Step>
  <Step title="Get your API key">
    Sign up for a Plants API account and generate your API key from the dashboard.
  </Step>
  <Step title="Initialize the client">
    Import and set up the Plants client to start making API calls.
    
    ```typescript
    import { PlantClient } from "@plantstore/sdk";
    
    const client = new PlantClient({ apiKey: "YOUR_API_KEY" });
    ```
  </Step>
</Steps>

## Cards

### Single Card
<Card 
    title="Getting started" 
    icon="regular rocket" 
    href="/docs/getting-started"
>
    Learn how to get started with the Plants API
</Card>

### Card Group
<CardGroup cols={2}>
  <Card 
    title="Authentication" 
    icon="regular key" 
    href="/docs/authentication"
  >
    Learn how to authenticate your API requests
  </Card>
  <Card 
    title="Rate limits" 
    icon="regular gauge" 
    href="/docs/rate-limits"
  >
    Understand API rate limits and best practices
  </Card>
  <Card 
    title="Webhooks" 
    icon="regular webhook" 
    href="/docs/webhooks"
  >
    Set up webhooks to receive real-time updates
  </Card>
  <Card 
    title="SDKs" 
    icon="regular code" 
    href="/docs/sdks"
  >
    Explore our client libraries for various languages
  </Card>
</CardGroup>

## Callouts

### Info Callout
<Info>
  This is an informational callout to highlight important information.
</Info>

### Note Callout
<Note title="Important note">
  Use note callouts to draw attention to important details or caveats.
</Note>

### Warning Callout
<Warning>
  Warning callouts alert users to potential issues or important considerations.
</Warning>

### Tip Callout
<Tip>
  Tip callouts provide helpful suggestions and best practices.
</Tip>

### Danger Callout
<Danger>
  Danger callouts warn about critical issues that could cause problems.
</Danger>

## Accordions

<AccordionGroup>
  <Accordion title="What is a plant API?">
    A plant API allows you to programmatically access plant data, care instructions, and tracking features.
  </Accordion>
  <Accordion title="How do I get started?">
    Sign up for an account, get your API key, and install one of our SDKs to start making requests.
  </Accordion>
  <Accordion title="What languages are supported?">
    We support TypeScript, Python, Go, Java, Ruby, C#, PHP, and Swift.
  </Accordion>
</AccordionGroup>

## Tabs

<Tabs>
  <Tab title="TypeScript">
    ```typescript
    import { PlantClient } from "@plantstore/sdk";
    
    const client = new PlantClient({ apiKey: "YOUR_API_KEY" });
    ```
  </Tab>
  <Tab title="Python">
    ```python
    from plantstore import PlantClient
    
    client = PlantClient(api_key="YOUR_API_KEY")
    ```
  </Tab>
  <Tab title="Go">
    ```go
    import "github.com/plantstore/plantstore-go"
    
    client := plantstore.NewClient("YOUR_API_KEY")
    ```
  </Tab>
</Tabs>

## Endpoint Request Snippet

Reference API endpoints from your API specification:

<EndpointRequestSnippet endpoint="POST /plants/{plantId}" />

## Endpoint Response Snippet

Show example responses from your API:

<EndpointResponseSnippet endpoint="POST /plants/{plantId}" />

## Tables

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| API Requests | 1,000/month | 100,000/month | Unlimited |
| Rate Limit | 10/second | 100/second | Custom |
| Support | Community | Email | Dedicated |
| SLA | None | 99.9% | 99.99% |

## Links

Use markdown links to reference other pages:
- [Getting Started](/docs/getting-started)
- [API Reference](/api-reference)
- [External Link](https://example.com)

## Lists

### Unordered Lists
- First item
- Second item
- Third item with nested items:
  - Nested item 1
  - Nested item 2

### Ordered Lists
1. First step
2. Second step
3. Third step with details:
   1. Sub-step A
   2. Sub-step B

## Inline Code

Use `inline code` to reference code elements, variables, or commands within text.

## Blockquotes

> This is a blockquote. Use it for quotes, citations, or to emphasize important text.

## Horizontal Rules

Use horizontal rules to separate sections:

---

## Images

![Plant Image](https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400)

## Parameter Fields

<ParamField path="name" type="string" required={true}>
  The name of the plant
</ParamField>

<ParamField path="species" type="string" required={false}>
  The scientific species name
</ParamField>

<ParamField path="wateringFrequency" type="number" required={false} default={7}>
  How often to water the plant (in days)
</ParamField>

## Markdown Snippets

Reuse content across multiple pages:

<Markdown src="/snippets/common-setup.mdx" />

## Best Practices for Using Components

1. **Use Steps for sequential content**: Tutorials, setup guides, and walkthroughs benefit from numbered steps
2. **Use Cards for navigation**: Help users discover related content with card groups
3. **Use Callouts sparingly**: Only highlight truly important information to avoid overwhelming readers
4. **Use Code Blocks with context**: Add titles and highlight relevant lines to guide readers
5. **Use Tabs for multi-language examples**: Keep code examples organized and easy to switch between
6. **Use Accordions for optional details**: Hide detailed information that not all users need
7. **Use Endpoint Snippets for API examples**: Link directly to your API specification for consistency
8. **Use Tables for structured data**: Compare features, list parameters, or show configuration options
