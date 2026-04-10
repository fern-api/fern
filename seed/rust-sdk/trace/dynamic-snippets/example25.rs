use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .playlist
        .createplaylist(
            1,
            &CreateplaylistRequest {
                datetime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                optional_datetime: Some(
                    DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                ),
                body: PlaylistCreateRequest {
                    name: "name".to_string(),
                    problems: vec![
                        ProblemId("problems".to_string()),
                        ProblemId("problems".to_string()),
                    ],
                    ..Default::default()
                },
            },
            None,
        )
        .await;
}
