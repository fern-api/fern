use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .catalog
        .create_catalog_image(
            &CreateCatalogImageRequest {
                image_file: b"test file content".to_vec(),
                request: CreateCatalogImageRequest {
                    catalog_object_id: "catalog_object_id".to_string(),
                    ..Default::default()
                },
            },
            None,
        )
        .await;
}
