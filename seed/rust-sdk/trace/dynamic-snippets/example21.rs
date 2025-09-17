use seed_trace::{ClientConfig, TraceClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.problem_update_problem("problemId", serde_json::json!({"problemName":"problemName","problemDescription":{"boards":[{"type":"html","value":"boards"},{"type":"html","value":"boards"}]},"files":{"JAVA":{"solutionFile":{"filename":"filename","contents":"contents"},"readOnlyFiles":[{"filename":"filename","contents":"contents"},{"filename":"filename","contents":"contents"}]}},"inputParams":[{"variableType":{"type":"integerType"},"name":"name"},{"variableType":{"type":"integerType"},"name":"name"}],"outputType":{"type":"integerType"},"testcases":[{"testCase":{"id":"id","params":[{"type":"integerValue","value":1},{"type":"integerValue","value":1}]},"expectedResult":{"type":"integerValue","value":1}},{"testCase":{"id":"id","params":[{"type":"integerValue","value":1},{"type":"integerValue","value":1}]},"expectedResult":{"type":"integerValue","value":1}}],"methodName":"methodName"})).await;
}
