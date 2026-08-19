use seed_union_query_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UnionQueryParametersClient::new(config).expect("Failed to build client");
    client
        .events
        .subscribe(
            &SubscribeQueryRequest {
                event_type: Some(EventTypeParam::EventTypeEnum(EventTypeEnum::GroupCreated)),
                tags: Some(StringOrListParam::String("tags".to_string())),
                ..Default::default()
            },
            None,
        )
        .await;
}
