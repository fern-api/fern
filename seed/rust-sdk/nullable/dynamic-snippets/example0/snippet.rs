use seed_nullable::{ClientConfig, NullableClient, GetUsersRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = NullableClient::new(config).expect("Failed to build client");
    client.nullable_get_users(GetUsersRequest { usernames: vec![Some("usernames")], avatar: Some("avatar"), activated: vec![Some(true)], tags: vec![Some(Some("tags"))], extra: Some(Some(true)) }).await;
}
