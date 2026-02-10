use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .problem
        .get_default_starter_files(
            &GetDefaultStarterFilesRequest {
                input_params: vec![
                    VariableTypeAndName {
                        variable_type: VariableType::IntegerType,
                        name: "name".to_string(),
                    },
                    VariableTypeAndName {
                        variable_type: VariableType::IntegerType,
                        name: "name".to_string(),
                    },
                ],
                output_type: VariableType::IntegerType,
                method_name: "methodName".to_string(),
            },
            None,
        )
        .await;
}
