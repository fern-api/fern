use seed_enum::prelude::{*};
use seed_enum::{Operand, ColorOrOperand, Color};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client.path_param.send(&Operand::GreaterThan, &ColorOrOperand::Color(Color::Red), None).await;
}
