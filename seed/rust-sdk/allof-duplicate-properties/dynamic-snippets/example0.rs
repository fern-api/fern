use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .create_plant_order(
            &"plantId".to_string(),
            &PlantOrder {
                order_base_fields: OrderBase {
                    order_id: "orderId".to_string(),
                    amount: 1.1,
                    currency: "currency".to_string(),
                    date_time: None,
                },
                plant_name: "plantName".to_string(),
            },
            None,
        )
        .await;
}
