use seed_enum::{ClientConfig, EnumClient, SendEnumAsQueryParamRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .query_param_send(SendEnumAsQueryParamRequest {
            operand: ">",
            operand_or_color: "red",
        })
        .await;
}
