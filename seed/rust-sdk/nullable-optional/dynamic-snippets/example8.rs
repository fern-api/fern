use seed_nullable_optional::{ClientConfig, NullableOptionalClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client.nullable_optional_test_deserialization(serde_json::json!({"requiredString":"requiredString","nullableString":"nullableString","optionalString":"optionalString","optionalNullableString":"optionalNullableString","nullableEnum":"ADMIN","optionalEnum":"active","nullableUnion":{"type":"email","emailAddress":"emailAddress","subject":"subject","htmlContent":"htmlContent"},"optionalUnion":{"type":"user","id":"id","username":"username","email":"email","phone":"phone","createdAt":"2024-01-15T09:30:00Z","updatedAt":"2024-01-15T09:30:00Z","address":{"street":"street","city":"city","state":"state","zipCode":"zipCode","country":"country","buildingId":"buildingId","tenantId":"tenantId"}},"nullableList":["nullableList","nullableList"],"nullableMap":{"nullableMap":1},"nullableObject":{"street":"street","city":"city","state":"state","zipCode":"zipCode","country":"country","buildingId":"buildingId","tenantId":"tenantId"},"optionalObject":{"id":"id","name":"name","domain":"domain","employeeCount":1}})).await;
}
