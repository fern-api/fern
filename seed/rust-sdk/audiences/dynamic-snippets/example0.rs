use seed_audiences::{AudiencesClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = AudiencesClient::new(config).expect("Failed to build client");
    client.folder_a_service_get_direct_thread().await;
}
