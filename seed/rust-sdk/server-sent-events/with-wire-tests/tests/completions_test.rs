use reqwest::Client;
use seed_server_sent_events::prelude::*;

/// Resets all WireMock request journal
async fn reset_wiremock_requests() -> Result<(), Box<dyn std::error::Error>> {
    let wiremock_admin_url = "http://localhost:8080/__admin";
    Client::new()
        .delete(format!("{}/requests", wiremock_admin_url))
        .send()
        .await?;
    return Ok(());
}

/// Verifies the number of requests made to WireMock
async fn verify_request_count(
    method: &str,
    url_path: &str,
    query_params: Option<HashMap<String, String>>,
    expected: usize,
) -> Result<(), Box<dyn std::error::Error>> {
    let wiremock_admin_url = "http://localhost:8080/__admin";
    let mut request_body = json!({
        "method": method,
        "urlPath": url_path,
    });
    if let Some(params) = query_params {
        let query_parameters: Value = params
            .into_iter()
            .map(|(k, v)| (k, json!({"equalTo": v})))
            .collect();
        request_body["queryParameters"] = query_parameters;
    }
    let response = Client::new()
        .post(format!("{}/requests/find", wiremock_admin_url))
        .json(&request_body)
        .send()
        .await?;
    let result: Value = response.json().await?;
    let requests = result["requests"]
        .as_array()
        .ok_or("Invalid response from WireMock")?;
    assert_eq!(
        requests.len(),
        expected,
        "Expected {} requests, found {}",
        expected,
        requests.len()
    );
    return Ok(());
}

#[tokio::test]
async fn test_completions_stream_with_wiremock() {
    reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = "http://localhost:8080";

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ServerSentEventsClient::new(config).expect("Failed to build client");

    let result = client
        .completions
        .stream(
            &StreamCompletionRequest {
                query: "query".to_string(),
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    verify_request_count("POST", "/stream", None, 1)
        .await
        .unwrap();
}
