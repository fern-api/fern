use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File, FormDataBuilder};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn post(&self, file: crate::core::File, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "",
            crate::core::FormDataBuilder::new().add_file("file", file).build(),
            None,
            options,
        ).await
    }

    pub async fn just_file(&self, file: crate::core::File, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/just-file",
            crate::core::FormDataBuilder::new().add_file("file", file).build(),
            None,
            options,
        ).await
    }

    pub async fn just_file_with_query_params(&self, maybe_string: Option<Option<String>>, integer: Option<i32>, maybe_integer: Option<Option<i32>>, list_of_strings: Option<String>, optional_list_of_strings: Option<Option<String>>, file: crate::core::File, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/just-file-with-query-params",
            crate::core::FormDataBuilder::new().add_file("file", file).add_optional_text("maybe_string", &maybe_string).add_optional_text("integer", &integer).add_optional_text("maybe_integer", &maybe_integer).add_optional_text("list_of_strings", &list_of_strings).add_optional_text("optional_list_of_strings", &optional_list_of_strings).build(),
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = maybe_string {
                query_params.push(("maybeString".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = integer {
                query_params.push(("integer".to_string(), value.to_string()));
            }
            if let Some(Some(value)) = maybe_integer {
                query_params.push(("maybeInteger".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = list_of_strings {
                query_params.push(("listOfStrings".to_string(), value.to_string()));
            }
            if let Some(Some(value)) = optional_list_of_strings {
                query_params.push(("optionalListOfStrings".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn with_content_type(&self, file: crate::core::File, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/with-content-type",
            crate::core::FormDataBuilder::new().add_file("file", file).build(),
            None,
            options,
        ).await
    }

    pub async fn with_form_encoding(&self, file: crate::core::File, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/with-form-encoding",
            crate::core::FormDataBuilder::new().add_file("file", file).build(),
            None,
            options,
        ).await
    }

    pub async fn with_form_encoded_containers(&self, file: crate::core::File, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "",
            crate::core::FormDataBuilder::new().add_file("file", file).build(),
            None,
            options,
        ).await
    }

    pub async fn optional_args(&self, file: crate::core::File, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/optional-args",
            crate::core::FormDataBuilder::new().add_file("file", file).build(),
            None,
            options,
        ).await
    }

    pub async fn with_inline_type(&self, file: crate::core::File, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/inline-type",
            crate::core::FormDataBuilder::new().add_file("file", file).build(),
            None,
            options,
        ).await
    }

    pub async fn simple(&self, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/snippet",
            None,
            None,
            options,
        ).await
    }

}

