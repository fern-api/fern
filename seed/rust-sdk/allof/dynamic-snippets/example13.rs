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
                planted_date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                height_in_feet: Some(1.1),
                tree_description: Some("treeDescription".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
