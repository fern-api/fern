use seed_enum::{ClientConfig, EnumClient, SendEnumInlinedRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .inlined_request_send(SendEnumInlinedRequest {
            operand: ">",
            operand_or_color: "red",
        })
        .await;
}
