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
        .update_problem(
            &ProblemId("problemId".to_string()),
            &CreateProblemRequest {
                problem_name: "problemName".to_string(),
                problem_description: ProblemDescription {
                    boards: vec![
                        ProblemDescriptionBoard::Html {
                            value: "value".to_string(),
                        },
                        ProblemDescriptionBoard::Html {
                            value: "value".to_string(),
                        },
                    ],
                },
                files: HashMap::from([(
                    Language::Java,
                    ProblemFiles {
                        solution_file: FileInfo {
                            filename: "filename".to_string(),
                            contents: "contents".to_string(),
                        },
                        read_only_files: vec![
                            FileInfo {
                                filename: "filename".to_string(),
                                contents: "contents".to_string(),
                            },
                            FileInfo {
                                filename: "filename".to_string(),
                                contents: "contents".to_string(),
                            },
                        ],
                    },
                )]),
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
                testcases: vec![
                    TestCaseWithExpectedResult {
                        test_case: TestCase {
                            id: "id".to_string(),
                            params: vec![
                                VariableValue::IntegerValue { value: 0 },
                                VariableValue::IntegerValue { value: 0 },
                            ],
                        },
                        expected_result: VariableValue::IntegerValue { value: 0 },
                    },
                    TestCaseWithExpectedResult {
                        test_case: TestCase {
                            id: "id".to_string(),
                            params: vec![
                                VariableValue::IntegerValue { value: 0 },
                                VariableValue::IntegerValue { value: 0 },
                            ],
                        },
                        expected_result: VariableValue::IntegerValue { value: 0 },
                    },
                ],
                method_name: "methodName".to_string(),
            },
            None,
        )
        .await;
}
