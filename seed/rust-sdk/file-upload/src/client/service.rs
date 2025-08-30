use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn post(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn just_file(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/just-file",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn just_file_with_query_params(&self, maybe_string: Option<String>, integer: Option<i32>, maybe_integer: Option<i32>, list_of_strings: Option<String>, optional_list_of_strings: Option<String>, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/just-file-with-query-params",
            Some(serde_json::to_value(request).unwrap_or_default()),
            {
            let mut query_params = Vec::new();
            if let Some(value) = maybe_string {
                query_params.push(("maybeString".to_string(), value.clone()));
            }
            if let Some(value) = integer {
                query_params.push(("integer".to_string(), value.to_string()));
            }
            if let Some(value) = maybe_integer {
                query_params.push(("maybeInteger".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = list_of_strings {
                query_params.push(("listOfStrings".to_string(), value.clone()));
            }
            if let Some(value) = optional_list_of_strings {
                query_params.push(("optionalListOfStrings".to_string(), value.clone()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn with_content_type(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/with-content-type",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn with_form_encoding(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/with-form-encoding",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn with_form_encoded_containers(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn optional_args(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/optional-args",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn with_inline_type(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/inline-type",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn simple(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/snippet",
            None,
            None,
            options,
        ).await
    }

}

