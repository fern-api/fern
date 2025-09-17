use seed_cross_package_type_names::{ClientConfig, CrossPackageTypeNamesClient, FindRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = CrossPackageTypeNamesClient::new(config).expect("Failed to build client");
    client
        .foo_find(FindRequest {
            optional_string: "optionalString",
            public_property: Some("publicProperty"),
            private_property: Some(1),
        })
        .await;
}
