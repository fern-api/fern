use seed_package_yml::{ClientConfig, PackageYmlClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = PackageYmlClient::new(config).expect("Failed to build client");
    client
        .echo(
            "id-ksfd9c1",
            serde_json::json!({"name":"Hello world!","size":20}),
        )
        .await;
}
