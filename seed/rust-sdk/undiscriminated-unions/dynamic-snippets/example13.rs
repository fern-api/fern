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
        .testcamelcaseproperties(
            &UnionTestCamelCasePropertiesRequest {
                payment_method: PaymentMethodUnion::TokenizeCard(TokenizeCard {
                    method: "method".to_string(),
                    card_number: "cardNumber".to_string(),
                    ..Default::default()
                }),
            },
            None,
        )
        .await;
}
