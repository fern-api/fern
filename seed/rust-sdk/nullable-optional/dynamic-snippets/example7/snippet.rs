use seed_nullable_optional::{ClientConfig, NullableOptionalClient, UpdateComplexProfileRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client.nullable_optional_update_complex_profile("profileId", UpdateComplexProfileRequest { nullable_role: Some(Some("ADMIN")), nullable_status: Some(Some("active")), nullable_notification: Some(Some(serde_json::json!({"type":"email","emailAddress":"emailAddress","subject":"subject","htmlContent":"htmlContent"}))), nullable_search_result: Some(Some(serde_json::json!({"type":"user","id":"id","username":"username","email":"email","phone":"phone","createdAt":"2024-01-15T09:30:00Z","updatedAt":"2024-01-15T09:30:00Z","address":{"street":"street","city":"city","state":"state","zipCode":"zipCode","country":"country","buildingId":"buildingId","tenantId":"tenantId"}}))), nullable_array: Some(Some(vec!["nullableArray", "nullableArray"])) }).await;
}
