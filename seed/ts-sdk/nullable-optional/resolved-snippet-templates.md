```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.getUser("userId");

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.createUser({
  username: "username",
  email: "email",
  phone: "phone",
  address: {
    street: "street",
    city: "city",
    state: "state",
    zipCode: "zipCode",
    country: "country",
    buildingId: "buildingId",
    tenantId: "tenantId",
  },
});

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.updateUser("userId", {
  username: "username",
  email: "email",
  phone: "phone",
  address: {
    street: "street",
    city: "city",
    state: "state",
    zipCode: "zipCode",
    country: "country",
    buildingId: "buildingId",
    tenantId: "tenantId",
  },
});

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.listUsers({
  limit: 1,
  offset: 1,
  includeDeleted: true,
  sortBy: "sortBy",
});

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.searchUsers({
  query: "query",
  department: "department",
  role: "role",
  isActive: true,
});

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });        
await client.nullableOptional.createComplexProfile(
	{
		id: "id",
		nullableNotification: nullableNotification: { 
				type : "email", 
				emailAddress: "emailAddress",
				subject: "subject",
				htmlContent: "htmlContent"
			},
		optionalNotification: optionalNotification: { 
				type : "email", 
				emailAddress: "emailAddress",
				subject: "subject",
				htmlContent: "htmlContent"
			},
		optionalNullableNotification: optionalNullableNotification: { 
				type : "email", 
				emailAddress: "emailAddress",
				subject: "subject",
				htmlContent: "htmlContent"
			},
		nullableSearchResult: nullableSearchResult: { 
				type : "user", 
				id: "id",
				username: "username",
				email: "email",
				phone: "phone",
				createdAt: "2024-01-15T09:30:00Z",
				updatedAt: "2024-01-15T09:30:00Z",
				address: {
						street: "street",
						city: "city",
						state: "state",
						zipCode: "zipCode",
						country: "country",
						buildingId: "buildingId",
						tenantId: "tenantId"
					}
			},
		optionalSearchResult: optionalSearchResult: { 
				type : "user", 
				id: "id",
				username: "username",
				email: "email",
				phone: "phone",
				createdAt: "2024-01-15T09:30:00Z",
				updatedAt: "2024-01-15T09:30:00Z",
				address: {
						street: "street",
						city: "city",
						state: "state",
						zipCode: "zipCode",
						country: "country",
						buildingId: "buildingId",
						tenantId: "tenantId"
					}
			},
		nullableArray: [
				"nullableArray",
				"nullableArray"
			],
		optionalArray: [
				"optionalArray",
				"optionalArray"
			],
		optionalNullableArray: [
				"optionalNullableArray",
				"optionalNullableArray"
			],
		nullableListOfNullables: [
				"nullableListOfNullables",
				"nullableListOfNullables"
			],
		nullableMapOfNullables: {
				"nullableMapOfNullables": {
					street: "street",
					city: "city",
					state: "state",
					zipCode: "zipCode",
					country: "country",
					buildingId: "buildingId",
					tenantId: "tenantId"
				}
			},
		nullableListOfUnions: [
				{ 
					type : "email", 
					emailAddress: "emailAddress",
					subject: "subject",
					htmlContent: "htmlContent"
				},
				{ 
					type : "email", 
					emailAddress: "emailAddress",
					subject: "subject",
					htmlContent: "htmlContent"
				}
			],
		optionalMapOfEnums: {
				"optionalMapOfEnums": "ADMIN"
			}
	}
)

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.getComplexProfile("profileId");

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });        
await client.nullableOptional.updateComplexProfile(
	"profileId",
	{
		nullableNotification: nullableNotification: { 
			type : "email", 
			emailAddress: "emailAddress",
			subject: "subject",
			htmlContent: "htmlContent"
		},
		nullableSearchResult: nullableSearchResult: { 
			type : "user", 
			id: "id",
			username: "username",
			email: "email",
			phone: "phone",
			createdAt: "2024-01-15T09:30:00Z",
			updatedAt: "2024-01-15T09:30:00Z",
			address: {
					street: "street",
					city: "city",
					state: "state",
					zipCode: "zipCode",
					country: "country",
					buildingId: "buildingId",
					tenantId: "tenantId"
				}
		},
		nullableArray: [
			"nullableArray",
			"nullableArray"
		]
	}
)

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });        
await client.nullableOptional.testDeserialization(
	{
		requiredString: "requiredString",
		nullableString: "nullableString",
		optionalString: "optionalString",
		optionalNullableString: "optionalNullableString",
		nullableUnion: nullableUnion: { 
				type : "email", 
				emailAddress: "emailAddress",
				subject: "subject",
				htmlContent: "htmlContent"
			},
		optionalUnion: optionalUnion: { 
				type : "user", 
				id: "id",
				username: "username",
				email: "email",
				phone: "phone",
				createdAt: "2024-01-15T09:30:00Z",
				updatedAt: "2024-01-15T09:30:00Z",
				address: {
						street: "street",
						city: "city",
						state: "state",
						zipCode: "zipCode",
						country: "country",
						buildingId: "buildingId",
						tenantId: "tenantId"
					}
			},
		nullableList: [
				"nullableList",
				"nullableList"
			],
		nullableMap: {
				"nullableMap": 1
			},
		nullableObject: {
				street: "street",
				city: "city",
				state: "state",
				zipCode: "zipCode",
				country: "country",
				buildingId: "buildingId",
				tenantId: "tenantId"
			},
		optionalObject: {
				id: "id",
				name: "name",
				domain: "domain",
				employeeCount: 1
			}
	}
)

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
undefined;

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.getNotificationSettings("userId");

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.updateTags("userId", {
  tags: ["tags", "tags"],
  categories: ["categories", "categories"],
  labels: ["labels", "labels"],
});

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.getSearchResults({
  query: "query",
  filters: {
    filters: "filters",
  },
  includeTypes: ["includeTypes", "includeTypes"],
});

```


