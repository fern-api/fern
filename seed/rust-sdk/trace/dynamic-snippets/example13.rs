use seed_trace::{ClientConfig, GetPlaylistsRequest, TraceClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .playlist_get_playlists(
            1,
            GetPlaylistsRequest {
                limit: Some(1),
                other_field: "otherField",
                multi_line_docs: "multiLineDocs",
                optional_multiple_field: vec![Some("optionalMultipleField")],
                multiple_field: vec!["multipleField"],
            },
        )
        .await;
}
