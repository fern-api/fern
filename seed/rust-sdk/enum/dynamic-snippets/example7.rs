use seed_enum::prelude::*;
use seed_enum::{Color, ColorOrOperand, Operand};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .query_param
        .send_list(
            &SendListQueryRequest {
                operand: vec![Operand::GreaterThan],
                maybe_operand: vec![Some(Operand::GreaterThan)],
                operand_or_color: vec![ColorOrOperand::Color(Color::Red)],
                maybe_operand_or_color: vec![Some(ColorOrOperand::Color(Color::Red))],
            },
            None,
        )
        .await;
}
