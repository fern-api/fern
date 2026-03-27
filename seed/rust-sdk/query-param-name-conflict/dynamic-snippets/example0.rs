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
                filter_assigned_to: None,
                filter_is_complete: None,
                filter_date: None,
                fields: None,
                bulk_update_tasks_request_assigned_to: None,
                bulk_update_tasks_request_date: None,
                bulk_update_tasks_request_is_complete: None,
                text: None,
            },
            None,
        )
        .await;
}
