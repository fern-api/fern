use seed_examples::{ClientConfig, ExamplesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client.service_create_movie(serde_json::json!({"id":"movie-c06a4ad7","prequel":"movie-cv9b914f","title":"The Boy and the Heron","from":"Hayao Miyazaki","rating":8,"type":"movie","tag":"tag-wf9as23d","metadata":{"actors":["Christian Bale","Florence Pugh","Willem Dafoe"],"releaseDate":"2023-12-08","ratings":{"rottenTomatoes":97,"imdb":7.6}},"revenue":1000000})).await;
}
