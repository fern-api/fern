use seed_undiscriminated_unions::{ClientConfig, UndiscriminatedUnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client.union_.get_metadata(None).await;
}
