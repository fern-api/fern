use seed_extra_properties::{ClientConfig, CreateUserRequest, ExtraPropertiesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ExtraPropertiesClient::new(config).expect("Failed to build client");
    client
        .user_create_user(CreateUserRequest {
            type_: "CreateUserRequest",
            version: "v1",
            name: "name",
        })
        .await;
}
