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
        .problem
        .getdefaultstarterfiles(
            &ProblemGetDefaultStarterFilesRequest {
                input_params: vec![
                    VariableTypeAndName {
                        variable_type: VariableType::VariableTypeZero(VariableTypeZero {
                            r#type: VariableTypeZeroType::IntegerType,
                        }),
                        name: "name".to_string(),
                    },
                    VariableTypeAndName {
                        variable_type: VariableType::VariableTypeZero(VariableTypeZero {
                            r#type: VariableTypeZeroType::IntegerType,
                        }),
                        name: "name".to_string(),
                    },
                ],
                output_type: VariableType::VariableTypeZero(VariableTypeZero {
                    r#type: VariableTypeZeroType::IntegerType,
                }),
                method_name: "methodName".to_string(),
            },
            None,
        )
        .await;
}
