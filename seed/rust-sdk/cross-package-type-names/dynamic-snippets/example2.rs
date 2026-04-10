use seed_cross_package_type_names::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = CrossPackageTypeNamesClient::new(config).expect("Failed to build client");
    client
        .foo
        .find(
            &FindRequest {
                optional_string: OptionalString(Some("optionalString".to_string())),
                public_property: Some("publicProperty".to_string()),
                private_property: Some(1),
            },
            None,
        )
        .await;
}
