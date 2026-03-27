use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .bulk_update_tasks(
            &BulkUpdateTasksRequest {
                filter_assigned_to: Some("filter_assigned_to".to_string()),
                filter_is_complete: Some("filter_is_complete".to_string()),
                filter_date: Some("filter_date".to_string()),
                fields: Some("_fields".to_string()),
                bulk_update_tasks_request_assigned_to: Some("assigned_to".to_string()),
                bulk_update_tasks_request_date: Some(
                    NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
                ),
                bulk_update_tasks_request_is_complete: Some(true),
                text: Some("text".to_string()),
            },
            None,
        )
        .await;
}
