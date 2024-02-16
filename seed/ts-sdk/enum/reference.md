
## InlinedRequest


<details><summary> <code>enum_.send({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### Usage 

```ts
import { SeedEnumClient, SeedEnum } from "";

const seedEnum = new SeedEnumClient;
await seedEnum.inlinedRequest.send({
    value: SeedEnum.Operand.GreaterThan
});

```



</dd>
</dl>

</details>




## PathParam


<details><summary> <code>enum_.send({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### Usage 

```ts
import { SeedEnumClient, SeedEnum } from "";

const seedEnum = new SeedEnumClient;
await seedEnum.pathParam.send(SeedEnum.Operand.GreaterThan);

```



</dd>
</dl>

</details>




## QueryParam


<details><summary> <code>enum_.send({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### Usage 

```ts
import { SeedEnumClient, SeedEnum } from "";

const seedEnum = new SeedEnumClient;
await seedEnum.queryParam.send({
    value: SeedEnum.Operand.GreaterThan
});

```



</dd>
</dl>

</details>


