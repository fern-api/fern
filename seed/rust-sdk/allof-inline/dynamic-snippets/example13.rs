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
                id: "id".to_string(),
                tree_name: "treeName".to_string(),
                tree_description: Some("treeDescription".to_string()),
                tree_species: "treeSpecies".to_string(),
                height_in_feet: Some(1.1),
                planted_date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                ..Default::default()
            },
            None,
        )
        .await;
}
