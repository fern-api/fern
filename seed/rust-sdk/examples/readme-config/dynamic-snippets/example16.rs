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
        .service
        .createbigentity(
            &BigEntity {
                cast_member: Some(CastMember::Actor(Actor {
                    name: "name".to_string(),
                    id: "id".to_string(),
                    ..Default::default()
                })),
                extended_movie: Some(ExtendedMovie {
                    movie_fields: Movie {
                        id: MovieId("id".to_string()),
                        prequel: Some(MovieId("prequel".to_string())),
                        title: "title".to_string(),
                        from: "from".to_string(),
                        rating: 1.1,
                        r#type: MovieType::Movie,
                        tag: CommonsTag("tag".to_string()),
                        book: Some("book".to_string()),
                        metadata: HashMap::from([(
                            "metadata".to_string(),
                            serde_json::json!({"key":"value"}),
                        )]),
                        revenue: 1000000,
                    },
                    cast: vec!["cast".to_string(), "cast".to_string()],
                }),
                entity: Some(Entity {
                    r#type: Type::BasicType(BasicType::Primitive),
                    name: "name".to_string(),
                }),
                metadata: Some(Metadata::Html {
                    data: MetadataHtml {
                        value: Some("value".to_string()),
                        ..Default::default()
                    },
                }),
                common_metadata: Some(CommonsMetadata {
                    id: "id".to_string(),
                    data: Some(HashMap::from([(
                        "data".to_string(),
                        Some("data".to_string()),
                    )])),
                    json_string: Some("jsonString".to_string()),
                    ..Default::default()
                }),
                event_info: Some(CommonsEventInfo::CommonsEventInfoZero(
                    CommonsEventInfoZero {
                        commons_metadata_fields: CommonsMetadata {
                            id: "id".to_string(),
                            data: Some(HashMap::from([(
                                "data".to_string(),
                                Some("data".to_string()),
                            )])),
                            json_string: Some("jsonString".to_string()),
                            ..Default::default()
                        },
                        r#type: CommonsEventInfoZeroType::Metadata,
                    },
                )),
                data: Some(CommonsData::r#String {
                    data: CommonsDataString {
                        value: Some("value".to_string()),
                        ..Default::default()
                    },
                }),
                migration: Some(Migration {
                    name: "name".to_string(),
                    status: MigrationStatus::Running,
                }),
                exception: Some(Exception::ExceptionZero(ExceptionZero {
                    exception_info_fields: ExceptionInfo {
                        exception_type: "exceptionType".to_string(),
                        exception_message: "exceptionMessage".to_string(),
                        exception_stacktrace: "exceptionStacktrace".to_string(),
                        ..Default::default()
                    },
                    r#type: ExceptionZeroType::Generic,
                })),
                test: Some(Test::And {
                    data: TestAnd {
                        value: Some(true),
                        ..Default::default()
                    },
                }),
                node: Some(Node {
                    name: "name".to_string(),
                    nodes: Some(vec![
                        Node {
                            name: "name".to_string(),
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: None,
                                    trees: None,
                                    ..Default::default()
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: None,
                                    trees: None,
                                    ..Default::default()
                                },
                            ]),
                            trees: Some(vec![
                                Tree {
                                    ..Default::default()
                                },
                                Tree {
                                    ..Default::default()
                                },
                            ]),
                            ..Default::default()
                        },
                        Node {
                            name: "name".to_string(),
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: None,
                                    trees: None,
                                    ..Default::default()
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: None,
                                    trees: None,
                                    ..Default::default()
                                },
                            ]),
                            trees: Some(vec![
                                Tree {
                                    ..Default::default()
                                },
                                Tree {
                                    ..Default::default()
                                },
                            ]),
                            ..Default::default()
                        },
                    ]),
                    trees: Some(vec![
                        Tree {
                            nodes: Some(vec![]),
                            ..Default::default()
                        },
                        Tree {
                            nodes: Some(vec![]),
                            ..Default::default()
                        },
                    ]),
                    ..Default::default()
                }),
                directory: Some(Directory {
                    name: "name".to_string(),
                    files: Some(vec![
                        File {
                            name: "name".to_string(),
                            contents: "contents".to_string(),
                            ..Default::default()
                        },
                        File {
                            name: "name".to_string(),
                            contents: "contents".to_string(),
                            ..Default::default()
                        },
                    ]),
                    directories: Some(vec![
                        Directory {
                            name: "name".to_string(),
                            files: Some(vec![]),
                            directories: Some(vec![
                                Directory {
                                    name: "name".to_string(),
                                    files: None,
                                    directories: None,
                                    ..Default::default()
                                },
                                Directory {
                                    name: "name".to_string(),
                                    files: None,
                                    directories: None,
                                    ..Default::default()
                                },
                            ]),
                            ..Default::default()
                        },
                        Directory {
                            name: "name".to_string(),
                            files: Some(vec![]),
                            directories: Some(vec![
                                Directory {
                                    name: "name".to_string(),
                                    files: None,
                                    directories: None,
                                    ..Default::default()
                                },
                                Directory {
                                    name: "name".to_string(),
                                    files: None,
                                    directories: None,
                                    ..Default::default()
                                },
                            ]),
                            ..Default::default()
                        },
                    ]),
                    ..Default::default()
                }),
                moment: Some(Moment {
                    id: "id".to_string(),
                    date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
                    datetime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                    ..Default::default()
                }),
                ..Default::default()
            },
            None,
        )
        .await;
}
