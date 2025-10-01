use seed_enum::{ClientConfig, EnumClient, SendQueryRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .query_param
        .send(
            &SendQueryRequest {
                operand: Operand::GreaterThan,
                maybe_operand: Some(Operand::GreaterThan),
                operand_or_color: ColorOrOperand::Color(Color::Red),
                maybe_operand_or_color: Some(ColorOrOperand::Color(Color::Red)),
            },
            None,
        )
        .await;
}
