use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .playlist
        .update_playlist(
            &1,
            &PlaylistId("playlistId".to_string()),
            &Some(UpdatePlaylistRequest {
                name: "name".to_string(),
                problems: vec![
                    ProblemId("problems".to_string()),
                    ProblemId("problems".to_string()),
                ],
            }),
            None,
        )
        .await;
}
