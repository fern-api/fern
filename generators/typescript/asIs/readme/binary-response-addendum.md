<details>
<summary>Save binary response to a file</summary>

<details>
<summary>Node.js</summary>

<details>
<summary>ReadableStream (most-efficient)</summary>

```ts
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

<%= snippet %>
const stream = response.stream();
const nodeStream = Readable.fromWeb(stream);
const writeStream = createWriteStream('path/to/file');

await pipeline(nodeStream, writeStream);
```

</details>

<details>
<summary>ArrayBuffer</summary>

```ts
import { writeFile } from 'fs/promises';

<%= snippet %>
const arrayBuffer = await response.arrayBuffer();
await writeFile('path/to/file', Buffer.from(arrayBuffer));
```

</details>

<details>
<summary>Blob</summary>

```ts
import { writeFile } from 'fs/promises';

<%= snippet %>
const blob = await response.blob();
const arrayBuffer = await blob.arrayBuffer();
await writeFile('output.bin', Buffer.from(arrayBuffer));
```

</details>

<details>
<summary>Bytes (UIntArray8)</summary>

```ts
import { writeFile } from 'fs/promises';

<%= snippet %>
const bytes = await response.bytes();
await writeFile('path/to/file', bytes);
```

</details>

</details>

<details>
<summary>Bun</summary>

<details>
<summary>ReadableStream (most-efficient)</summary>

```ts
<%= snippet %>
const stream = response.stream();
await Bun.write('path/to/file', stream);
```

</details>

<details>
<summary>ArrayBuffer</summary>

```ts
<%= snippet %>
const arrayBuffer = await response.arrayBuffer();
await Bun.write('path/to/file', arrayBuffer);
```

</details>

<details>
<summary>Blob</summary>

```ts
<%= snippet %>
const blob = await response.blob();
await Bun.write('path/to/file', blob);
```

</details>

<details>
<summary>Bytes (UIntArray8)</summary>

```ts
<%= snippet %>
const bytes = await response.bytes();
await Bun.write('path/to/file', bytes);
```

</details>

</details>

<details>
<summary>Deno</summary>

<details>
<summary>ReadableStream (most-efficient)</summary>

```ts
<%= snippet %>
const stream = response.stream();
const file = await Deno.open('path/to/file', { write: true, create: true });
await stream.pipeTo(file.writable);
```

</details>

<details>
<summary>ArrayBuffer</summary>

```ts
<%= snippet %>
const arrayBuffer = await response.arrayBuffer();
await Deno.writeFile('path/to/file', new Uint8Array(arrayBuffer));
```

</details>

<details>
<summary>Blob</summary>

```ts
<%= snippet %>
const blob = await response.blob();
const arrayBuffer = await blob.arrayBuffer();
await Deno.writeFile('path/to/file', new Uint8Array(arrayBuffer));
```

</details>

<details>
<summary>Bytes (UIntArray8)</summary>

```ts
<%= snippet %>
const bytes = await response.bytes();
await Deno.writeFile('path/to/file', bytes);
```

</details>

</details>

<details>
<summary>Browser</summary>

<details>
<summary>Blob (most-efficient)</summary>

```ts
<%= snippet %>
const blob = await response.blob();
const url = URL.createObjectURL(blob);

// trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'filename';
a.click();
URL.revokeObjectURL(url);
```

</details>

<details>
<summary>ReadableStream</summary>

```ts
<%= snippet %>
const stream = response.stream();
const reader = stream.getReader();
const chunks = [];

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  chunks.push(value);
}

const blob = new Blob(chunks);
const url = URL.createObjectURL(blob);

// trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'filename';
a.click();
URL.revokeObjectURL(url);
```

</details>

<details>
<summary>ArrayBuffer</summary>

```ts
<%= snippet %>
const arrayBuffer = await response.arrayBuffer();
const blob = new Blob([arrayBuffer]);
const url = URL.createObjectURL(blob);

// trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'filename';
a.click();
URL.revokeObjectURL(url);
```

</details>

<details>
<summary>Bytes (UIntArray8)</summary>

```ts
<%= snippet %>
const bytes = await response.bytes();
const blob = new Blob([bytes]);
const url = URL.createObjectURL(blob);

// trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'filename';
a.click();
URL.revokeObjectURL(url);
```

</details>

</details>

</details>

<details>
<summary>Convert binary response to text</summary>

<details>
<summary>ReadableStream</summary>

```ts
<%= snippet %>
const stream = response.stream();
const text = await new Response(stream).text();
```

</details>

<details>
<summary>ArrayBuffer</summary>

```ts
<%= snippet %>
const arrayBuffer = await response.arrayBuffer();
const text = new TextDecoder().decode(arrayBuffer);
```

</details>

<details>
<summary>Blob</summary>

```ts
<%= snippet %>
const blob = await response.blob();
const text = await blob.text();
```

</details>

<details>
<summary>Bytes (UIntArray8)</summary>

```ts
<%= snippet %>
const bytes = await response.bytes();
const text = new TextDecoder().decode(bytes);
```

</details>

</details>