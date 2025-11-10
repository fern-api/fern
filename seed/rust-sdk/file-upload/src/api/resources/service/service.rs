use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn post(
        &self,
        request: &PostRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn just_file(
        &self,
        request: &JustFileRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "/just-file",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn just_file_with_query_params(
        &self,
        request: &JustFileWithQueryParamsRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "/just-file-with-query-params",
                request.clone().to_multipart(),
                QueryBuilder::new()
                    .string("maybeString", request.maybe_string.clone())
                    .int("integer", request.integer.clone())
                    .int("maybeInteger", request.maybe_integer.clone())
                    .string("listOfStrings", request.list_of_strings.clone())
                    .string(
                        "optionalListOfStrings",
                        request.optional_list_of_strings.clone(),
                    )
                    .build(),
                options,
            )
            .await
    }

    pub async fn with_content_type(
        &self,
        request: &WithContentTypeRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "/with-content-type",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn with_form_encoding(
        &self,
        request: &WithFormEncodingRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "/with-form-encoding",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn with_form_encoded_containers(
        &self,
        request: &WithFormEncodedContainersRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn optional_args(
        &self,
        request: &OptionalArgsRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "/optional-args",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn with_inline_type(
        &self,
        request: &WithInlineTypeRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "/inline-type",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn simple(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::POST, "/snippet", None, None, options)
            .await
    }
}
