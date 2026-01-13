use seed_trace::prelude::{*};
use seed_trace::{PlaylistId};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.playlist.delete_playlist(1, &PlaylistId("playlist_id".to_string()), None).await;
}
