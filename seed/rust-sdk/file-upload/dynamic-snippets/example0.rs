use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .post(
            &PostRequest {
                file: b"test file content".to_vec(),
                file_list: b"test file content".to_vec(),
                maybe_file: b"test file content".to_vec(),
                maybe_file_list: b"test file content".to_vec(),
                maybe_string: None,
                integer: None,
                maybe_integer: None,
                optional_list_of_strings: None,
                list_of_objects: None,
                optional_metadata: None,
                optional_object_type: None,
                optional_id: None,
                alias_object: None,
                list_of_alias_object: None,
                alias_list_of_object: None,
            },
            None,
        )
        .await;
}
