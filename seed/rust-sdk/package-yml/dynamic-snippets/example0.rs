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
            &"id-ksfd9c1".to_string(),
            &EchoRequest {
                name: "Hello world!".to_string(),
                size: 20,
            },
            None,
        )
        .await;
}
