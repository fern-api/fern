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
        .get_playlists(
            1,
            &GetPlaylistsQueryRequest {
                limit: Some(1),
                other_field: "otherField".to_string(),
                multi_line_docs: "multiLineDocs".to_string(),
                optional_multiple_field: vec![Some("optionalMultipleField".to_string())],
                multiple_field: vec!["multipleField".to_string()],
            },
            None,
        )
        .await;
}
