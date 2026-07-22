pub use crate::prelude::*;

/// Query parameters for authorize
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct AuthorizeQueryRequest {
    pub response_type: String,
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub redirect_uri: String,
    #[serde(default)]
    pub code_challenge: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code_challenge_method: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,
}

impl AuthorizeQueryRequest {
    pub fn builder() -> AuthorizeQueryRequestBuilder {
        <AuthorizeQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AuthorizeQueryRequestBuilder {
    response_type: Option<String>,
    client_id: Option<String>,
    redirect_uri: Option<String>,
    code_challenge: Option<String>,
    code_challenge_method: Option<String>,
    scope: Option<String>,
    state: Option<String>,
}

impl AuthorizeQueryRequestBuilder {
    pub fn response_type(mut self, value: impl Into<String>) -> Self {
        self.response_type = Some(value.into());
        self
    }

    pub fn client_id(mut self, value: impl Into<String>) -> Self {
        self.client_id = Some(value.into());
        self
    }

    pub fn redirect_uri(mut self, value: impl Into<String>) -> Self {
        self.redirect_uri = Some(value.into());
        self
    }

    pub fn code_challenge(mut self, value: impl Into<String>) -> Self {
        self.code_challenge = Some(value.into());
        self
    }

    pub fn code_challenge_method(mut self, value: impl Into<String>) -> Self {
        self.code_challenge_method = Some(value.into());
        self
    }

    pub fn scope(mut self, value: impl Into<String>) -> Self {
        self.scope = Some(value.into());
        self
    }

    pub fn state(mut self, value: impl Into<String>) -> Self {
        self.state = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AuthorizeQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`response_type`](AuthorizeQueryRequestBuilder::response_type)
    /// - [`client_id`](AuthorizeQueryRequestBuilder::client_id)
    /// - [`redirect_uri`](AuthorizeQueryRequestBuilder::redirect_uri)
    /// - [`code_challenge`](AuthorizeQueryRequestBuilder::code_challenge)
    pub fn build(self) -> Result<AuthorizeQueryRequest, BuildError> {
        Ok(AuthorizeQueryRequest {
            response_type: self
                .response_type
                .ok_or_else(|| BuildError::missing_field("response_type"))?,
            client_id: self
                .client_id
                .ok_or_else(|| BuildError::missing_field("client_id"))?,
            redirect_uri: self
                .redirect_uri
                .ok_or_else(|| BuildError::missing_field("redirect_uri"))?,
            code_challenge: self
                .code_challenge
                .ok_or_else(|| BuildError::missing_field("code_challenge"))?,
            code_challenge_method: self.code_challenge_method,
            scope: self.scope,
            state: self.state,
        })
    }
}
