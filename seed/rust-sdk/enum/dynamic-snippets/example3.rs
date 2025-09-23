use seed_enum::{ClientConfig, EnumClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = EnumClient::new(config).expect("Failed to build client");
    client.path_param_send(">", "red").await;
}
