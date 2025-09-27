use seed_examples::{
    BigEntity, CastMember, ClientConfig, Data, Directory, Entity, EventInfo, ExamplesClient,
    Exception, ExceptionInfo, ExtendedMovie, File, Metadata, Migration, MigrationStatus, Moment,
    MovieId, Node, Tag, Test, Tree, Type,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client.service.create_big_entity(&BigEntity {
        cast_member: Some(serde_json::json!({"name":"name","id":"id"})),
        extended_movie: Some(ExtendedMovie {
            id: MovieId("id".to_string()),
            prequel: Some(MovieId("prequel".to_string())),
            title: "title".to_string(),
            from: "from".to_string(),
            rating: 1.1,
            r#type: "movie".to_string(),
            tag: Tag("tag".to_string()),
            book: Some("book".to_string()),
            metadata: todo!("Unhandled type reference"),
            revenue: 1000000,
            cast: vec!["cast".to_string(), "cast".to_string()],
            movie_fields: todo!()
        }),
        entity: Some(Entity {
            r#type: "primitive".to_string(),
            name: "name".to_string()
        }),
        metadata: Some(serde_json::json!({"type":"html","value":"metadata","extra":{"extra":"extra"},"tags":["tags"]})),
        common_metadata: Some(Metadata {
            id: "id".to_string(),
            data: Some(todo!("Unhandled type reference")),
            json_string: Some("jsonString".to_string())
        }),
        event_info: Some(serde_json::json!({"type":"metadata","id":"id","data":{"data":"data"},"jsonString":"jsonString"})),
        data: Some(serde_json::json!({"type":"string","value":"data"})),
        migration: Some(Migration {
            name: "name".to_string(),
            status: MigrationStatus::Running
        }),
        exception: Some(serde_json::json!({"type":"generic","exceptionType":"exceptionType","exceptionMessage":"exceptionMessage","exceptionStacktrace":"exceptionStacktrace"})),
        test: Some(serde_json::json!({"type":"and","value":true})),
        node: Some(Node {
            name: "name".to_string(),
            nodes: Some(vec![Node {
                name: "name".to_string(),
                nodes: Some(vec![Node {
                    name: "name".to_string(),
                    nodes: Some(vec![]),
                    trees: Some(vec![])
                }, Node {
                    name: "name".to_string(),
                    nodes: Some(vec![]),
                    trees: Some(vec![])
                }]),
                trees: Some(vec![Tree {
                    nodes: Some(vec![])
                }, Tree {
                    nodes: Some(vec![])
                }])
            }, Node {
                name: "name".to_string(),
                nodes: Some(vec![Node {
                    name: "name".to_string(),
                    nodes: Some(vec![]),
                    trees: Some(vec![])
                }, Node {
                    name: "name".to_string(),
                    nodes: Some(vec![]),
                    trees: Some(vec![])
                }]),
                trees: Some(vec![Tree {
                    nodes: Some(vec![])
                }, Tree {
                    nodes: Some(vec![])
                }])
            }]),
            trees: Some(vec![Tree {
                nodes: Some(vec![Node {
                    name: "name".to_string(),
                    nodes: Some(vec![]),
                    trees: Some(vec![])
                }, Node {
                    name: "name".to_string(),
                    nodes: Some(vec![]),
                    trees: Some(vec![])
                }])
            }, Tree {
                nodes: Some(vec![Node {
                    name: "name".to_string(),
                    nodes: Some(vec![]),
                    trees: Some(vec![])
                }, Node {
                    name: "name".to_string(),
                    nodes: Some(vec![]),
                    trees: Some(vec![])
                }])
            }])
        }),
        directory: Some(Directory {
            name: "name".to_string(),
            files: Some(vec![File {
                name: "name".to_string(),
                contents: "contents".to_string()
            }, File {
                name: "name".to_string(),
                contents: "contents".to_string()
            }]),
            directories: Some(vec![Directory {
                name: "name".to_string(),
                files: Some(vec![File {
                    name: "name".to_string(),
                    contents: "contents".to_string()
                }, File {
                    name: "name".to_string(),
                    contents: "contents".to_string()
                }]),
                directories: Some(vec![Directory {
                    name: "name".to_string(),
                    files: Some(vec![]),
                    directories: Some(vec![])
                }, Directory {
                    name: "name".to_string(),
                    files: Some(vec![]),
                    directories: Some(vec![])
                }])
            }, Directory {
                name: "name".to_string(),
                files: Some(vec![File {
                    name: "name".to_string(),
                    contents: "contents".to_string()
                }, File {
                    name: "name".to_string(),
                    contents: "contents".to_string()
                }]),
                directories: Some(vec![Directory {
                    name: "name".to_string(),
                    files: Some(vec![]),
                    directories: Some(vec![])
                }, Directory {
                    name: "name".to_string(),
                    files: Some(vec![]),
                    directories: Some(vec![])
                }])
            }])
        }),
        moment: Some(Moment {
            id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32".to_string(),
            date: "2023-01-15".to_string(),
            datetime: "2024-01-15T09:30:00Z".to_string()
        })
    }, None).await;
}
