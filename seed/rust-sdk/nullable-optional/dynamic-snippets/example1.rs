use seed_nullable_optional::{ClientConfig, NullableOptionalClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client.nullable_optional_create_user(serde_json::json!({"username":"username","email":"email","phone":"phone","address":{"street":"street","city":"city","state":"state","zipCode":"zipCode","country":"country","buildingId":"buildingId","tenantId":"tenantId"}})).await;
}
