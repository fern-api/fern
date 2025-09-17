use seed_enum::{ClientConfig, EnumClient, SendEnumListAsQueryParamRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .query_param_send_list(SendEnumListAsQueryParamRequest {
            operand: vec![">"],
            maybe_operand: vec![Some(">")],
            operand_or_color: vec!["red"],
            maybe_operand_or_color: vec![Some("red")],
        })
        .await;
}
