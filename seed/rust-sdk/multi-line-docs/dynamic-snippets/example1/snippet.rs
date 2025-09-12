use seed_multi_line_docs::{ClientConfig, MultiLineDocsClient, CreateUserRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = MultiLineDocsClient::new(config).expect("Failed to build client");
    client.user_create_user(CreateUserRequest { name: "name", age: Some(1) }).await;
}
