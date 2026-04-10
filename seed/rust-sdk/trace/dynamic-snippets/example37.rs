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
        .createproblem(
            &CreateProblemRequest {
                problem_name: "problemName".to_string(),
                problem_description: ProblemDescription {
                    boards: vec![
                        ProblemDescriptionBoard::Html {
                            data: ProblemDescriptionBoardHtml {
                                value: Some("value".to_string()),
                                ..Default::default()
                            },
                        },
                        ProblemDescriptionBoard::Html {
                            data: ProblemDescriptionBoardHtml {
                                value: Some("value".to_string()),
                                ..Default::default()
                            },
                        },
                    ],
                    ..Default::default()
                },
                files: HashMap::from([(
                    "files".to_string(),
                    ProblemFiles {
                        solution_file: FileInfo {
                            filename: "filename".to_string(),
                            contents: "contents".to_string(),
                            ..Default::default()
                        },
                        read_only_files: vec![
                            FileInfo {
                                filename: "filename".to_string(),
                                contents: "contents".to_string(),
                                ..Default::default()
                            },
                            FileInfo {
                                filename: "filename".to_string(),
                                contents: "contents".to_string(),
                                ..Default::default()
                            },
                        ],
                        ..Default::default()
                    },
                )]),
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
                testcases: vec![
                    TestCaseWithExpectedResult {
                        test_case: TestCase {
                            id: "id".to_string(),
                            params: vec![
                                VariableValue::VariableValueZero(VariableValueZero {
                                    r#type: VariableValueZeroType::IntegerValue,
                                    value: Some(1),
                                }),
                                VariableValue::VariableValueZero(VariableValueZero {
                                    r#type: VariableValueZeroType::IntegerValue,
                                    value: Some(1),
                                }),
                            ],
                            ..Default::default()
                        },
                        expected_result: VariableValue::VariableValueZero(VariableValueZero {
                            r#type: VariableValueZeroType::IntegerValue,
                            value: Some(1),
                        }),
                    },
                    TestCaseWithExpectedResult {
                        test_case: TestCase {
                            id: "id".to_string(),
                            params: vec![
                                VariableValue::VariableValueZero(VariableValueZero {
                                    r#type: VariableValueZeroType::IntegerValue,
                                    value: Some(1),
                                }),
                                VariableValue::VariableValueZero(VariableValueZero {
                                    r#type: VariableValueZeroType::IntegerValue,
                                    value: Some(1),
                                }),
                            ],
                            ..Default::default()
                        },
                        expected_result: VariableValue::VariableValueZero(VariableValueZero {
                            r#type: VariableValueZeroType::IntegerValue,
                            value: Some(1),
                        }),
                    },
                ],
                method_name: "methodName".to_string(),
            },
            None,
        )
        .await;
}
