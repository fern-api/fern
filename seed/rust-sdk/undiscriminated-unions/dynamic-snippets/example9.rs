use seed_undiscriminated_unions::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .test_camel_case_properties(
            &PaymentRequest {
                payment_method: PaymentMethodUnion::TokenizeCard(TokenizeCard {
                    method: "method".to_string(),
                    card_number: "cardNumber".to_string(),
                }),
            },
            None,
        )
        .await;
}
