```typescript
import { SeedFileUploadClient } from "@fern/file-upload";

const client = new SeedFileUploadClient({ environment: "YOUR_BASE_URL" });
await client.service.post({
  file: fs.createReadStream("/path/to/your/file"),
  fileList: [fs.createReadStream("/path/to/your/file")],
  maybeFile: fs.createReadStream("/path/to/your/file"),
  maybeFileList: [fs.createReadStream("/path/to/your/file")],
});
 
```                        


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
await client.service.justFileWithQueryParams({
  maybeString: "string",
  integer: 1,
  maybeInteger: 1,
  listOfStrings: "string",
  optionalListOfStrings: "string",
  file: fs.createReadStream("/path/to/your/file"),
});
 
```                        


```typescript
import { SeedFileUploadClient } from "@fern/file-upload";

const client = new SeedFileUploadClient({ environment: "YOUR_BASE_URL" });
await client.service.withContentType({
  file: fs.createReadStream("/path/to/your/file"),
});
 
```                        


