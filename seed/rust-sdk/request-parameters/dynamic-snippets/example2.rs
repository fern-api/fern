use seed_request_parameters::{ClientConfig, GetUsersRequest, RequestParametersClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = RequestParametersClient::new(config).expect("Failed to build client");
    client.user_get_username(GetUsersRequest { limit: 1, id: todo!("Unhandled primitive: UUID"), date: todo!("Unhandled primitive: DATE"), deadline: todo!("Unhandled primitive: DATE_TIME"), bytes: todo!("Unhandled primitive: BASE_64"), user: serde_json::json!({"name":"name","tags":["tags","tags"]}), user_list: vec![serde_json::json!({"name":"name","tags":["tags","tags"]}), serde_json::json!({"name":"name","tags":["tags","tags"]})], optional_deadline: Some(todo!("Unhandled primitive: DATE_TIME")), key_value: todo!("Unhandled type reference"), optional_string: Some("optionalString"), nested_user: serde_json::json!({"name":"name","user":{"name":"name","tags":["tags","tags"]}}), optional_user: Some(serde_json::json!({"name":"name","tags":["tags","tags"]})), exclude_user: vec![serde_json::json!({"name":"name","tags":["tags","tags"]})], filter: vec!["filter"], long_param: todo!("Unhandled primitive: LONG"), big_int_param: todo!("Unhandled primitive: BIG_INTEGER") }).await;
}
