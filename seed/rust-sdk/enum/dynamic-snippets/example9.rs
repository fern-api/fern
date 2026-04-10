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
        .sendlist(
            &SendlistQueryRequest {
                operand: vec![Some(Operand::GreaterThan)],
                maybe_operand: vec![Some(Operand::GreaterThan)],
                operand_or_color: vec![Some(ColorOrOperand::Color(Color::Red))],
                maybe_operand_or_color: vec![Some(ColorOrOperand::Color(Color::Red))],
            },
            None,
        )
        .await;
}
