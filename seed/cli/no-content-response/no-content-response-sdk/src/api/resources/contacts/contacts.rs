use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ContactsClient {
    pub http_client: HttpClient,
}

impl ContactsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Creates a new contact. Returns 200 with the contact or 204 with no content.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create(
        &self,
        request: &CreateContactRequest,
        options: Option<RequestOptions>,
    ) -> Result<Option<Contact>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "contacts",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Gets a contact by ID. Returns 200 with the contact.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Contact, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("contacts/{}", id),
                None,
                None,
                options,
            )
            .await
    }
}
