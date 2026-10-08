use custom_imdb_sdk::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_imdb_create_movie_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_imdb_create_movie_with_wiremock".to_string(),
    );
    let client = CustomImdbClient::new(config).expect("Failed to build client");

    let result = client
        .imdb
        .create_movie(
            &CreateMovieRequest {
                title: "title".to_string(),
                rating: 1.1,
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/movies/create-movie", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_imdb_get_movie_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_imdb_get_movie_with_wiremock".to_string(),
    );
    let client = CustomImdbClient::new(config).expect("Failed to build client");

    let result = client
        .imdb
        .get_movie(&MovieId("movieId".to_string()), None)
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/movies/movieId", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_imdb_get_movie_throws_not_found_error_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_imdb_get_movie_throws_not_found_error_with_wiremock".to_string(),
    );
    let client = CustomImdbClient::new(config).expect("Failed to build client");

    let result = client
        .imdb
        .get_movie(&MovieId("movieId".to_string()), None)
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::NotFoundError"
    );
    match result {
        Err(ApiError::NotFoundError { message, .. }) => {
            assert_eq!(message, "Unknown error");
        }
        Err(other) => panic!("Expected ApiError::NotFoundError, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::NotFoundError, got a successful response"),
    }

    wire_test_utils::verify_request_count("GET", "/movies/movieId", None, 1)
        .await
        .unwrap();
}
