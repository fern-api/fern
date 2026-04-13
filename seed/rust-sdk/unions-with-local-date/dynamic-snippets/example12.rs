use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .union_
        .update(
            &Shape::ShapeZero(ShapeZero {
                circle_fields: Circle {
                    radius: 1.1,
                    ..Default::default()
                },
                r#type: ShapeZeroType::Circle,
            }),
            None,
        )
        .await;
}
