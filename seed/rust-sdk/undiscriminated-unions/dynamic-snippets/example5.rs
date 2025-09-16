use seed_undiscriminated_unions::{ClientConfig, UndiscriminatedUnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client.union__duplicate_types_union("string").await;
}
