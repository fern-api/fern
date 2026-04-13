use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .bigunion
        .update_many(
            &vec![
                BigUnion::BigUnionZero(BigUnionZero {
                    normal_sweet_fields: NormalSweet {
                        value: "value".to_string(),
                        ..Default::default()
                    },
                    r#type: BigUnionZeroType::NormalSweet,
                }),
                BigUnion::BigUnionZero(BigUnionZero {
                    normal_sweet_fields: NormalSweet {
                        value: "value".to_string(),
                        ..Default::default()
                    },
                    r#type: BigUnionZeroType::NormalSweet,
                }),
            ],
            None,
        )
        .await;
}
