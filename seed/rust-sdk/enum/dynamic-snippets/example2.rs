use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inlinedrequest
        .send(
            &InlinedRequestSendRequest {
                operand: Operand::GreaterThan,
                operand_or_color: ColorOrOperand::Color(Color::Red),
                maybe_operand: None,
                maybe_operand_or_color: None,
            },
            None,
        )
        .await;
}
