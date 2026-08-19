use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .create_plant(
            &PlantPost {
                species: "species".to_string(),
                family: "family".to_string(),
                genus: "genus".to_string(),
                sun_exposure: PlantPostSunExposure::Full,
                common_name: None,
                watering_frequency: None,
                planted_at: None,
                soil_type: None,
            },
            None,
        )
        .await;
}
