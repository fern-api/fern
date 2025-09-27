use seed_package_yml::{ClientConfig, PackageYmlClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = PackageYmlClient::new(config).expect("Failed to build client");
    client
        .echo(
            "id-ksfd9c1",
            serde_json::json!({"name":"Hello world!","size":20}),
        )
        .await;
}
