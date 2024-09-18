```typescript
import { SeedFileUploadClient } from "@fern/file-upload";

const client = new SeedFileUploadClient({ environment: "YOUR_BASE_URL" });
await client.service.post(
  fs.createReadStream("/path/to/your/file"),
  fs.createReadStream("/path/to/your/file")
);
 
```                        


```typescript
import { SeedFileUploadClient } from "@fern/file-upload";

const client = new SeedFileUploadClient({ environment: "YOUR_BASE_URL" });
await client.service.justFile(fs.createReadStream("/path/to/your/file"));
 
```                        


```typescript
import { SeedFileUploadClient } from "@fern/file-upload";

const client = new SeedFileUploadClient({ environment: "YOUR_BASE_URL" });
await client.service.justFileWithQueryParams(
  fs.createReadStream("/path/to/your/file"),
  {
    maybeString: "string",
    integer: 1,
    maybeInteger: 1,
    listOfStrings: "string",
    optionalListOfStrings: "string",
  }
);
 
```                        


```typescript
import { SeedFileUploadClient } from "@fern/file-upload";

const client = new SeedFileUploadClient({ environment: "YOUR_BASE_URL" });
await client.service.withContentType(fs.createReadStream("/path/to/your/file"));
 
```                        


