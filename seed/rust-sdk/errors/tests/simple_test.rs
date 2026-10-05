use seed_errors::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_without_endpoint_error_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_without_endpoint_error_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo_without_endpoint_error(
            &FooRequest {
                bar: "bar".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/foo1", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_without_endpoint_error_throws_not_found_error_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_without_endpoint_error_throws_not_found_error_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo_without_endpoint_error(
            &FooRequest {
                bar: "bar".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::NotFoundError"
    );
    match result {
        Err(ApiError::NotFoundError { message, .. }) => {
            assert_eq!(message, "message");
        }
        Err(other) => panic!("Expected ApiError::NotFoundError, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::NotFoundError, got a successful response"),
    }

    wire_test_utils::verify_request_count("POST", "/foo1", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_without_endpoint_error_throws_bad_request_error_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_without_endpoint_error_throws_bad_request_error_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo_without_endpoint_error(
            &FooRequest {
                bar: "bar".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::BadRequestError"
    );
    match result {
        Err(ApiError::BadRequestError { message, .. }) => {
            assert_eq!(message, "message");
        }
        Err(other) => panic!("Expected ApiError::BadRequestError, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::BadRequestError, got a successful response"),
    }

    wire_test_utils::verify_request_count("POST", "/foo1", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_without_endpoint_error_throws_internal_server_error_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_without_endpoint_error_throws_internal_server_error_with_wiremock"
            .to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo_without_endpoint_error(
            &FooRequest {
                bar: "bar".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::InternalServerError"
    );
    match result {
        Err(ApiError::InternalServerError { message, .. }) => {
            assert_eq!(message, "message");
        }
        Err(other) => panic!("Expected ApiError::InternalServerError, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::InternalServerError, got a successful response"),
    }

    wire_test_utils::verify_request_count("POST", "/foo1", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo(
            &FooRequest {
                bar: "bar".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/foo2", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_throws_foo_too_much_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_throws_foo_too_much_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo(
            &FooRequest {
                bar: "bar".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::FooTooMuch"
    );
    match result {
        Err(ApiError::FooTooMuch { message, .. }) => {
            assert_eq!(message, "message");
        }
        Err(other) => panic!("Expected ApiError::FooTooMuch, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::FooTooMuch, got a successful response"),
    }

    wire_test_utils::verify_request_count("POST", "/foo2", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_throws_not_found_error_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_throws_not_found_error_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo(
            &FooRequest {
                bar: "bar".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::NotFoundError"
    );
    match result {
        Err(ApiError::NotFoundError { message, .. }) => {
            assert_eq!(message, "message");
        }
        Err(other) => panic!("Expected ApiError::NotFoundError, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::NotFoundError, got a successful response"),
    }

    wire_test_utils::verify_request_count("POST", "/foo2", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_throws_bad_request_error_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_throws_bad_request_error_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo(
            &FooRequest {
                bar: "bar".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::BadRequestError"
    );
    match result {
        Err(ApiError::BadRequestError { message, .. }) => {
            assert_eq!(message, "message");
        }
        Err(other) => panic!("Expected ApiError::BadRequestError, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::BadRequestError, got a successful response"),
    }

    wire_test_utils::verify_request_count("POST", "/foo2", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_throws_internal_server_error_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_throws_internal_server_error_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo(
            &FooRequest {
                bar: "bar".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::InternalServerError"
    );
    match result {
        Err(ApiError::InternalServerError { message, .. }) => {
            assert_eq!(message, "message");
        }
        Err(other) => panic!("Expected ApiError::InternalServerError, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::InternalServerError, got a successful response"),
    }

    wire_test_utils::verify_request_count("POST", "/foo2", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_with_examples_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_with_examples_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo_with_examples(
            &FooRequest {
                bar: "hello".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/foo3", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_simple_foo_with_examples_throws_foo_too_much_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_simple_foo_with_examples_throws_foo_too_much_with_wiremock".to_string(),
    );
    let client = ErrorsClient::new(config).expect("Failed to build client");

    let result = client
        .simple
        .foo_with_examples(
            &FooRequest {
                bar: "hello".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::FooTooMuch"
    );
    match result {
        Err(ApiError::FooTooMuch { message, .. }) => {
            assert_eq!(message, "Too much foo");
        }
        Err(other) => panic!("Expected ApiError::FooTooMuch, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::FooTooMuch, got a successful response"),
    }

    wire_test_utils::verify_request_count("POST", "/foo3", None, 1)
        .await
        .unwrap();
}
