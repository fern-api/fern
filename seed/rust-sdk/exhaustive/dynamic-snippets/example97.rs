use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_union
        .endpoints_union_get_and_return_union(
            &TypesAnimal::TypesAnimalZero(TypesAnimalZero {
                types_dog_fields: TypesDog {
                    name: "name".to_string(),
                    likes_to_woof: true,
                    ..Default::default()
                },
                animal: TypesAnimalZeroAnimal::Dog,
            }),
            None,
        )
        .await;
}
