use seed_undiscriminated_unions::prelude::*;
use seed_undiscriminated_unions::UnionWithDuplicateTypes;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .duplicate_types_union(&UnionWithDuplicateTypes::String("string".to_string()), None)
        .await;
}
