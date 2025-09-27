use seed_audiences::{AudiencesClient, ClientConfig, FindRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = AudiencesClient::new(config).expect("Failed to build client");
    client
        .foo_find(FindRequest {
            optional_string: "optionalString",
            public_property: Some("publicProperty"),
            private_property: Some(1),
        })
        .await;
}
