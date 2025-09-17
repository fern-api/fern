use seed_enum::{ClientConfig, EnumClient, SendEnumInlinedRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .inlined_request_send(SendEnumInlinedRequest {
            operand: ">",
            maybe_operand: Some(">"),
            operand_or_color: "red",
            maybe_operand_or_color: Some("red"),
        })
        .await;
}
