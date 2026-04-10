use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .foo
        .find(
            &FooFindRequest {
                optional_string: Some(OptionalString(Some("optionalString".to_string()))),
                public_property: Some("publicProperty".to_string()),
                private_property: Some(1),
                ..Default::default()
            },
            None,
        )
        .await;
}
