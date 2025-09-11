use seed_enum::{ClientConfig, EnumClient, SendEnumAsHeaderRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = EnumClient::new(config).expect("Failed to build client");
    client.headers_send(SendEnumAsHeaderRequest { operand: ">", maybe_operand: Some(">"), operand_or_color: "red" }).await;
}
