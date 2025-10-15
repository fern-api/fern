use seed_package_yml::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = PackageYmlClient::new(config).expect("Failed to build client");
    client
        .echo(
            &"id".to_string(),
            &EchoRequest {
                name: "name".to_string(),
                size: 1,
            },
            None,
        )
        .await;
}
