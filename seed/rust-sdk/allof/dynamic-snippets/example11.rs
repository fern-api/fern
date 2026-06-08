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
                common_name: Some("commonName".to_string()),
                watering_frequency: Some(PlantBaseWateringFrequency::Daily),
                species: "species".to_string(),
                family: "family".to_string(),
                genus: "genus".to_string(),
                sun_exposure: PlantPostSunExposure::Full,
                planted_at: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                soil_type: Some("soilType".to_string()),
            },
            None,
        )
        .await;
}
