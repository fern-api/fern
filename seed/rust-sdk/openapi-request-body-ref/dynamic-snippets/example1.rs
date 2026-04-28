use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .vendor
        .update_vendor(
            &"vendor_id".to_string(),
            &UpdateVendorRequest {
                name: "name".to_string(),
                status: Some(UpdateVendorRequestStatus::Active),
                ..Default::default()
            },
            None,
        )
        .await;
}
