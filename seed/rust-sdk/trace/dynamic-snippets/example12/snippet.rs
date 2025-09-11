use seed_trace::{ClientConfig, TraceClient, CreatePlaylistRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.playlist_create_playlist(1, CreatePlaylistRequest { datetime: todo!("Unhandled primitive: DATE_TIME"), optional_datetime: Some(todo!("Unhandled primitive: DATE_TIME")), body: serde_json::json!({"name":"name","problems":["problems","problems"]}) }).await;
}
