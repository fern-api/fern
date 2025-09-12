use seed_audiences::{ClientConfig, AudiencesClient, FindRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = AudiencesClient::new(config).expect("Failed to build client");
    client.foo_find(FindRequest { optional_string: "optionalString", public_property: Some("publicProperty"), private_property: Some(1) }).await;
}
