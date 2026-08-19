use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .create_plant_with_schema(
            &CreatePlantWithSchemaRequest {
                name: Some("name".to_string()),
                species: Some("species".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
