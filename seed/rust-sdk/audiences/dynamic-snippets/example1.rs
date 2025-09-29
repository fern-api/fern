use seed_audiences::{AudiencesClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = AudiencesClient::new(config).expect("Failed to build client");
    client.folder_d_service_get_direct_thread().await;
}
