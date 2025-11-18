use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .file
        .service
        .get_file(
            &"file.txt".to_string(),
            Some(
                RequestOptions::new().additional_header("X-File-API-Version", "0.0.2".to_string()),
            ),
        )
        .await;
}
