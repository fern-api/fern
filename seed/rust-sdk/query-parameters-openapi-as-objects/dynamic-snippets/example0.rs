use seed_api::{ApiClient, ClientConfig, SearchRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .search(SearchRequest {
            limit: 1,
            id: "id",
            date: "date",
            deadline: todo!("Unhandled primitive: DATE_TIME"),
            bytes: "bytes",
            user: serde_json::json!({"name":"name","tags":["tags","tags"]}),
            user_list: vec![Some(
                serde_json::json!({"name":"name","tags":["tags","tags"]}),
            )],
            optional_deadline: Some(todo!("Unhandled primitive: DATE_TIME")),
            key_value: Some(todo!("Unhandled type reference")),
            optional_string: Some("optionalString"),
            nested_user: Some(
                serde_json::json!({"name":"name","user":{"name":"name","tags":["tags","tags"]}}),
            ),
            optional_user: Some(serde_json::json!({"name":"name","tags":["tags","tags"]})),
            exclude_user: vec![Some(
                serde_json::json!({"name":"name","tags":["tags","tags"]}),
            )],
            filter: vec![Some("filter")],
            neighbor: Some(serde_json::json!({"name":"name","tags":["tags","tags"]})),
            neighbor_required: serde_json::json!({"name":"name","tags":["tags","tags"]}),
        })
        .await;
}
