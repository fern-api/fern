use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .service
        .create_big_entity(
            &BigEntity {
                cast_member: Some(CastMember::Actor(Actor {
                    name: "name".to_string(),
                    id: "id".to_string(),
                })),
                extended_movie: Some(ExtendedMovie {
                    id: MovieId("id".to_string()),
                    prequel: Some(MovieId("prequel".to_string())),
                    title: "title".to_string(),
                    from: "from".to_string(),
                    rating: 1.1,
                    r#type: "movie".to_string(),
                    tag: Tag("tag".to_string()),
                    book: Some("book".to_string()),
                    metadata: HashMap::from([(
                        "metadata".to_string(),
                        serde_json::json!({"key":"value"}),
                    )]),
                    revenue: 1000000,
                    cast: vec!["cast".to_string(), "cast".to_string()],
                }),
                entity: Some(Entity {
                    r#type: Type::BasicType(BasicType::Primitive),
                    name: "name".to_string(),
                }),
                metadata: Some(Metadata2::Html {
                    value: "value".to_string(),
                    extra: HashMap::from([("extra".to_string(), "extra".to_string())]),
                    tags: HashSet::from(["tags".to_string()]),
                }),
                common_metadata: Some(Metadata {
                    id: "id".to_string(),
                    data: Some(HashMap::from([("data".to_string(), "data".to_string())])),
                    json_string: Some("jsonString".to_string()),
                }),
                event_info: Some(EventInfo::Metadata {
                    data: Metadata {
                        id: "id".to_string(),
                        data: Some(HashMap::from([("data".to_string(), "data".to_string())])),
                        json_string: Some("jsonString".to_string()),
                    },
                }),
                data: Some(Data::r#String {
                    value: "value".to_string(),
                }),
                migration: Some(Migration {
                    name: "name".to_string(),
                    status: MigrationStatus::Running,
                }),
                exception: Some(Exception::Generic {
                    data: ExceptionInfo {
                        exception_type: "exceptionType".to_string(),
                        exception_message: "exceptionMessage".to_string(),
                        exception_stacktrace: "exceptionStacktrace".to_string(),
                    },
                }),
                test: Some(Test::And { value: false }),
                node: Some(Node {
                    name: "name".to_string(),
                    nodes: Some(vec![
                        Node {
                            name: "name".to_string(),
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                            ]),
                            trees: Some(vec![
                                Tree {
                                    nodes: Some(vec![]),
                                },
                                Tree {
                                    nodes: Some(vec![]),
                                },
                            ]),
                        },
                        Node {
                            name: "name".to_string(),
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                            ]),
                            trees: Some(vec![
                                Tree {
                                    nodes: Some(vec![]),
                                },
                                Tree {
                                    nodes: Some(vec![]),
                                },
                            ]),
                        },
                    ]),
                    trees: Some(vec![
                        Tree {
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                            ]),
                        },
                        Tree {
                            nodes: Some(vec![
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                                Node {
                                    name: "name".to_string(),
                                    nodes: Some(vec![]),
                                    trees: Some(vec![]),
                                },
                            ]),
                        },
                    ]),
                }),
                directory: Some(Directory {
                    name: "name".to_string(),
                    files: Some(vec![
                        File {
                            name: "name".to_string(),
                            contents: "contents".to_string(),
                        },
                        File {
                            name: "name".to_string(),
                            contents: "contents".to_string(),
                        },
                    ]),
                    directories: Some(vec![
                        Directory {
                            name: "name".to_string(),
                            files: Some(vec![
                                File {
                                    name: "name".to_string(),
                                    contents: "contents".to_string(),
                                },
                                File {
                                    name: "name".to_string(),
                                    contents: "contents".to_string(),
                                },
                            ]),
                            directories: Some(vec![
                                Directory {
                                    name: "name".to_string(),
                                    files: Some(vec![]),
                                    directories: Some(vec![]),
                                },
                                Directory {
                                    name: "name".to_string(),
                                    files: Some(vec![]),
                                    directories: Some(vec![]),
                                },
                            ]),
                        },
                        Directory {
                            name: "name".to_string(),
                            files: Some(vec![
                                File {
                                    name: "name".to_string(),
                                    contents: "contents".to_string(),
                                },
                                File {
                                    name: "name".to_string(),
                                    contents: "contents".to_string(),
                                },
                            ]),
                            directories: Some(vec![
                                Directory {
                                    name: "name".to_string(),
                                    files: Some(vec![]),
                                    directories: Some(vec![]),
                                },
                                Directory {
                                    name: "name".to_string(),
                                    files: Some(vec![]),
                                    directories: Some(vec![]),
                                },
                            ]),
                        },
                    ]),
                }),
                moment: Some(Moment {
                    id: Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                    date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
                    datetime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                }),
            },
            None,
        )
        .await;
}
