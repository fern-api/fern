use seed_nullable::{ClientConfig, DeleteUserRequest, NullableClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = NullableClient::new(config).expect("Failed to build client");
    client
        .nullable_delete_user(DeleteUserRequest {
            username: Some(Some("xy")),
        })
        .await;
}
