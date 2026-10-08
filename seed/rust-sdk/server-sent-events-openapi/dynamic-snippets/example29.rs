use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .stream_x_fern_streaming_union(
            &StreamXFernStreamingUnionRequest::Message {
                data: UnionStreamMessageVariant {
                    union_stream_request_base_fields: UnionStreamRequestBase {
                        stream_response: Some(false),
                        prompt: "prompt".to_string(),
                        ..Default::default()
                    },
                    message: "message".to_string(),
                    ..Default::default()
                },
            },
            None,
        )
        .await;
}
