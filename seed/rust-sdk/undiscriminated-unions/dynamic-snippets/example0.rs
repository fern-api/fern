use seed_undiscriminated_unions::prelude::{*};
use seed_undiscriminated_unions::{MyUnion};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client.union_.get(&MyUnion::String("string".to_string()), None).await;
}
