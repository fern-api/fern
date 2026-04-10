use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .queryparam
        .send(
            &SendQueryRequest {
                operand: Operand::GreaterThan,
                operand_or_color: Color::Red,
                maybe_operand: None,
                maybe_operand_or_color: None,
            },
            None,
        )
        .await;
}
