use seed_audiences::{AudiencesClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = AudiencesClient::new(config).expect("Failed to build client");
    client.folder_a.service.get_direct_thread(None).await;
}
