use seed_undiscriminated_unions::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .aliased_object_union(
            &AliasedObjectUnion::AliasedLeafA(AliasedLeafA(LeafObjectA {
                only_in_a: "onlyInA".to_string(),
                shared_number: 1,
                ..Default::default()
            })),
            None,
        )
        .await;
}
