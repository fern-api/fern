use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .create_tree(
            &TreeRecord {
                tree_identifiable_fields: TreeIdentifiable {
                    id: "id".to_string(),
                    ..Default::default()
                },
                tree_name: "treeName".to_string(),
                tree_species: "treeSpecies".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;
}
