use seed_enum::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .headers
        .send(Some(
            RequestOptions::new()
                .additional_header("operand", Operand::GreaterThan)
                .additional_header("maybeOperand", Some(Operand::GreaterThan))
                .additional_header("operandOrColor", ColorOrOperand::Color(Color::Red))
                .additional_header("maybeOperandOrColor", None),
        ))
        .await;
}
