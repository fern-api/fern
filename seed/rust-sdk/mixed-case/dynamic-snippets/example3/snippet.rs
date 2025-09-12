use seed_mixed_case::{ClientConfig, MixedCaseClient, ListResourcesRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = MixedCaseClient::new(config).expect("Failed to build client");
    client.service_list_resources(ListResourcesRequest { page_limit: 1, before_date: todo!("Unhandled primitive: DATE") }).await;
}
