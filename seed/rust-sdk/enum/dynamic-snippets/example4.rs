use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .multipartform
        .multipartform(
            &MultipartformRequest {
                color: None,
                maybe_color: None,
                color_list: None,
                maybe_color_list: None,
            },
            None,
        )
        .await;
}
