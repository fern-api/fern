```typescript
import { SeedApiClient } from "@fern/file-upload-openapi";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.fileUploadExample.uploadFile({
  name: "name",
  file: fs.createReadStream("/path/to/your/file"),
});

```


