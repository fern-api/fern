use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .get_speech_to_speech_settings(
            &SpeechToSpeechRequest {
                voice_id: "voice_id".to_string(),
                model_id: Some("model_id".to_string()),
            },
            None,
        )
        .await;
}
