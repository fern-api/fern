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

    pub async fn justfile(
        &self,
        request: &JustfileRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "just-file",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn justfilewithqueryparams(
        &self,
        request: &JustfilewithqueryparamsRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "just-file-with-query-params",
                request.clone().to_multipart(),
                QueryBuilder::new()
                    .serialize("maybeString", request.maybe_string.clone())
                    .int("integer", request.integer.clone())
                    .serialize("maybeInteger", request.maybe_integer.clone())
                    .string_array("listOfStrings", request.list_of_strings.clone())
                    .serialize_array(
                        "optionalListOfStrings",
                        request.optional_list_of_strings.clone(),
                    )
                    .build(),
                options,
            )
            .await
    }

    pub async fn justfilewithoptionalqueryparams(
        &self,
        request: &JustfilewithoptionalqueryparamsRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "just-file-with-optional-query-params",
                request.clone().to_multipart(),
                QueryBuilder::new()
                    .serialize("maybeString", request.maybe_string.clone())
                    .serialize("maybeInteger", request.maybe_integer.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn withcontenttype(
        &self,
        request: &WithcontenttypeRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "with-content-type",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn withformencoding(
        &self,
        request: &WithformencodingRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "with-form-encoding",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn withformencodedcontainers(
        &self,
        request: &WithformencodedcontainersRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "form-encoded",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn optionalargs(
        &self,
        request: &OptionalargsRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "optional-args",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn withinlinetype(
        &self,
        request: &WithinlinetypeRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "inline-type",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn withjsonproperty(
        &self,
        request: &WithjsonpropertyRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "with-json-property",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn simple(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::POST, "snippet", None, None, options)
            .await
    }

    pub async fn withliteralandenumtypes(
        &self,
        request: &WithliteralandenumtypesRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "with-literal-enum",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }
}
