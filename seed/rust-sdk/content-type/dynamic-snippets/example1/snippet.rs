use seed_content_types::{ClientConfig, ContentTypesClient, PatchComplexRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client.service_patch_complex("id", PatchComplexRequest { name: Some("name"), age: Some(1), active: Some(true), metadata: Some(todo!("Unhandled type reference")), tags: Some(vec!["tags", "tags"]), email: Some(Some("email")), nickname: Some(Some("nickname")), bio: Some(Some("bio")), profile_image_url: Some(Some("profileImageUrl")), settings: Some(Some(todo!("Unhandled type reference"))) }).await;
}
