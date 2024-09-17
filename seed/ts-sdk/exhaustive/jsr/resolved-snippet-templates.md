```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.container.getAndReturnListOfPrimitives(
	{
		[
			"string"
		]
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.container.getAndReturnListOfObjects(
	{
		[
			{
				string: "string"
			}
		]
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.container.getAndReturnSetOfPrimitives(
	{
		new Set([
			"string"
		])
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.container.getAndReturnSetOfObjects(
	{
		new Set([
			{
				string: "string"
			}
		])
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.container.getAndReturnMapPrimToPrim(
	{
		{
			"string": "string"
		}
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.container.getAndReturnMapOfPrimToObject(
	{
		{
			"string": {
				string: "string"
			}
		}
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.container.getAndReturnOptional({
  string: "string",
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
undefined;
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.httpMethods.testGet("string");
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.httpMethods.testPost({
  string: "string",
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.httpMethods.testPut("string", {
  string: "string",
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.httpMethods.testPatch("string", {
  string: "string",
  integer: 1,
  long: 1000000,
  double: 1.1,
  bool: true,
  datetime: "2024-01-15T09:30:00Z",
  date: "2023-01-15",
  uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  base64: "SGVsbG8gd29ybGQh",
  list: ["string"],
  set: new Set(["string"]),
  map: {
    1: "string",
  },
  bigint: "123456789123456789",
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.httpMethods.testDelete("string");
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.object.getAndReturnWithOptionalField({
  string: "string",
  integer: 1,
  long: 1000000,
  double: 1.1,
  bool: true,
  datetime: "2024-01-15T09:30:00Z",
  date: "2023-01-15",
  uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  base64: "SGVsbG8gd29ybGQh",
  list: ["string"],
  set: new Set(["string"]),
  map: {
    1: "string",
  },
  bigint: "123456789123456789",
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.object.getAndReturnWithRequiredField({
  string: "string",
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.object.getAndReturnWithMapOfMap({
  map: {
    string: {
      string: "string",
    },
  },
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.object.getAndReturnNestedWithOptionalField({
  string: "string",
  nestedObject: {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: ["string"],
    set: new Set(["string"]),
    map: {
      1: "string",
    },
    bigint: "123456789123456789",
  },
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.object.getAndReturnNestedWithRequiredField("string", {
  string: "string",
  nestedObject: {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: ["string"],
    set: new Set(["string"]),
    map: {
      1: "string",
    },
    bigint: "123456789123456789",
  },
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList(
	{
		[
			{
				string: "string",
				nestedObject: {
					string: "string",
					integer: 1,
					long: 1000000,
					double: 1.1,
					bool: true,
					datetime: "2024-01-15T09:30:00Z",
					date: "2023-01-15",
					uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
					base64: "SGVsbG8gd29ybGQh",
					map: {
						"1": "string"
					},
					bigint: "123456789123456789"
				}
			}
		]
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.params.getWithPath("string");
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.params.getWithQuery({
  query: "string",
  number: 1,
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.params.getWithAllowMultipleQuery({
  query: "string",
  numer: 1,
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.endpoints.params.getWithPathAndQuery("string", {
  query: "string",
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.params.modifyWithPath(
	"string",
	{
		"string"
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.primitive.getAndReturnString(
	{
		"string"
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.primitive.getAndReturnInt(
	{
		1
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.primitive.getAndReturnLong(
	{
		1000000
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.primitive.getAndReturnDouble(
	{
		1.1
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.primitive.getAndReturnBool(
	{
		true
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.primitive.getAndReturnDatetime(
	{
		"2024-01-15T09:30:00Z"
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.primitive.getAndReturnDate(
	{
		"2023-01-15"
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.primitive.getAndReturnUuid(
	{
		"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.primitive.getAndReturnBase64(
	{
		"SGVsbG8gd29ybGQh"
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.endpoints.union.getAndReturnUnion(
	{
		{ 
			animal : "dog", 
			name: "string",
			likesToWoof: true
		}
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.inlinedRequests.postWithObjectBodyandResponse({
  string: "string",
  integer: 1,
  nestedObject: {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: ["string"],
    set: new Set(["string"]),
    map: {
      1: "string",
    },
    bigint: "123456789123456789",
  },
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.inlinedRequests.postWithObjectBodyandResponse({
  string: "string",
  integer: 1,
  nestedObject: {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: ["string"],
    set: new Set(["string"]),
    map: {
      1: "string",
    },
    bigint: "123456789123456789",
  },
});
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.noAuth.postWithNoAuth(
	{
		{"key":"value"}
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.noAuth.postWithNoAuth(
	{
		{"key":"value"}
	}
)
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.noReqBody.getWithNoRequestBody();
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.noReqBody.postWithNoRequestBody();
 
```                        


```typescript
import { SeedExhaustiveClient } from "@fern/exhaustive";

const client = new SeedExhaustiveClient({ environment: "YOUR_BASE_URL", token: "YOUR_TOKEN" });        
await client.reqWithHeaders.getWithCustomHeader(
	{
		xTestEndpointHeader: "string",
		"string"
	}
)
 
```                        


