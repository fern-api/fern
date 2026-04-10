use seed_audiences::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = AudiencesClient::new(config).expect("Failed to build client");
    client.folder_d.service.get_direct_thread(None).await;
}
