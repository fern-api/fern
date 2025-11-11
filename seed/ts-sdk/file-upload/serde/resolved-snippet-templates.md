```typescript
import { SeedFileUploadClient } from "@fern/file-upload";

const client = new SeedFileUploadClient({ environment: "YOUR_BASE_URL" });
await client.service.justFile({
  file: fs.createReadStream("/path/to/your/file"),
});

```


```typescript
import { SeedFileUploadClient } from "@fern/file-upload";

const client = new SeedFileUploadClient({ environment: "YOUR_BASE_URL" });
await client.service.optionalArgs({
  imageFile: fs.createReadStream("/path/to/your/file"),
});

```


```typescript
import { SeedFileUploadClient } from "@fern/file-upload";

const client = new SeedFileUploadClient({ environment: "YOUR_BASE_URL" });
await client.service.simple();

```


