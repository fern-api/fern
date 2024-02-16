
## NoHeaders





## OnlyLiteralHeaders


<details><summary> <code>literalHeaders.get({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### Usage 

```ts
import { SeedLiteralHeadersClient } from "";

const seedLiteralHeaders = new SeedLiteralHeadersClient;
await seedLiteralHeaders.onlyLiteralHeaders.get();

```



</dd>
</dl>

</details>




## WithNonLiteralHeaders


<details><summary> <code>literalHeaders.get({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### Usage 

```ts
import { SeedLiteralHeadersClient } from "";

const seedLiteralHeaders = new SeedLiteralHeadersClient;
await seedLiteralHeaders.withNonLiteralHeaders.get({
    integer: 42,
    literalServiceHeader: "service header",
    trueServiceHeader: true,
    nonLiteralEndpointHeader: "custom header",
    literalEndpointHeader: "endpoint header",
    trueEndpointHeader: true
});

```



</dd>
</dl>

</details>


