use seed_trace::{ClientConfig, TraceClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.admin_store_traced_test_case_v_2("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", "testCaseId", vec![serde_json::json!({"submissionId":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","lineNumber":1,"file":{"filename":"filename","directory":"directory"},"returnValue":{"type":"integerValue","value":1},"expressionLocation":{"start":1,"offset":1},"stack":{"numStackFrames":1,"topStackFrame":{"methodName":"methodName","lineNumber":1,"scopes":[{"variables":{"variables":{"type":"integerValue","value":1}}},{"variables":{"variables":{"type":"integerValue","value":1}}}]}},"stdout":"stdout"}), serde_json::json!({"submissionId":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","lineNumber":1,"file":{"filename":"filename","directory":"directory"},"returnValue":{"type":"integerValue","value":1},"expressionLocation":{"start":1,"offset":1},"stack":{"numStackFrames":1,"topStackFrame":{"methodName":"methodName","lineNumber":1,"scopes":[{"variables":{"variables":{"type":"integerValue","value":1}}},{"variables":{"variables":{"type":"integerValue","value":1}}}]}},"stdout":"stdout"})]).await;
}
