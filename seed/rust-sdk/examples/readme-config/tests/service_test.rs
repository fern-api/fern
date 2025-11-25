use reqwest::Client;
use seed_examples::prelude::*;

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
async fn test_service_get_movie_with_wiremock() {
    reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = "http://localhost:8080";

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client
        .service
        .get_movie(&MovieId("movie-c06a4ad7".to_string()), None)
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    verify_request_count("GET", "/movie/movie-c06a4ad7", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
async fn test_service_create_movie_with_wiremock() {
    reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = "http://localhost:8080";

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client
        .service
        .create_movie(
            &Movie {
                id: MovieId("movie-c06a4ad7".to_string()),
                prequel: Some(MovieId("movie-cv9b914f".to_string())),
                title: "The Boy and the Heron".to_string(),
                from: "Hayao Miyazaki".to_string(),
                rating: 8.0,
                r#type: "movie".to_string(),
                tag: Tag("tag-wf9as23d".to_string()),
                book: None,
                metadata: HashMap::from([
                    (
                        "actors".to_string(),
                        serde_json::json!(["Christian Bale", "Florence Pugh", "Willem Dafoe"]),
                    ),
                    ("releaseDate".to_string(), serde_json::json!("2023-12-08")),
                    (
                        "ratings".to_string(),
                        serde_json::json!({"rottenTomatoes":97,"imdb":7.6}),
                    ),
                ]),
                revenue: 1000000,
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    verify_request_count("POST", "/movie", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
async fn test_service_get_metadata_with_wiremock() {
    reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = "http://localhost:8080";

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client
        .service
        .get_metadata(
            &GetMetadataQueryRequest {
                shallow: Some(false),
                tag: vec![Some("development".to_string())],
            },
            Some(RequestOptions::new().additional_header("X-API-Version", "0.0.1".to_string())),
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    verify_request_count(
        "GET",
        "/metadata",
        Some(HashMap::from([
            ("shallow".to_string(), "false".to_string()),
            ("tag".to_string(), "development".to_string()),
        ])),
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
async fn test_service_create_big_entity_with_wiremock() {
    reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = "http://localhost:8080";

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client
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

    assert!(result.is_ok(), "Client method call should succeed");

    verify_request_count("POST", "/big-entity", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
async fn test_service_refresh_token_with_wiremock() {
    reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = "http://localhost:8080";

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client.service.refresh_token(&None, None).await;

    assert!(result.is_ok(), "Client method call should succeed");

    verify_request_count("POST", "/refresh-token", None, 1)
        .await
        .unwrap();
}
