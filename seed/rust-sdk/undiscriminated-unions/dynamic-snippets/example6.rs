use seed_undiscriminated_unions::{
    ClientConfig, NestedUnionL1, NestedUnionL2, NestedUnionRoot, UndiscriminatedUnionsClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .nested_unions(&NestedUnionRoot::String("string".to_string()), None)
        .await;
}
