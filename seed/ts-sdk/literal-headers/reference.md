
## NoHeaders





## OnlyLiteralHeaders


<details><summary> <code>literalHeaders.get({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

<dl>

<dd>

```ts
await seedLiteralHeaders.onlyLiteralHeaders.get();
```

</dl>

</dd>





</dd>
</dl>

</details>




## WithNonLiteralHeaders


<details><summary> <code>literalHeaders.get({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

<dl>

<dd>

```ts
await seedLiteralHeaders.withNonLiteralHeaders.get({
    integer: 42,
    literalServiceHeader: "service header",
    trueServiceHeader: true,
    nonLiteralEndpointHeader: "custom header",
    literalEndpointHeader: "endpoint header",
    trueEndpointHeader: true
});
```

</dl>

</dd>





</dd>
</dl>

</details>


