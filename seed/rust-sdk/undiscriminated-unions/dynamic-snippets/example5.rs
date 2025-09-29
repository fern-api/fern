use seed_undiscriminated_unions::{ClientConfig, UndiscriminatedUnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client.union__duplicate_types_union("string").await;
}
