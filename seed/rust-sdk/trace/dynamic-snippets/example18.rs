use seed_trace::{ClientConfig, TraceClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .playlist_update_playlist(
            1,
            "playlistId",
            Some(serde_json::json!({"name":"name","problems":["problems","problems"]})),
        )
        .await;
}
