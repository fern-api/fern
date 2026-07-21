pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetTokenAuthRequest {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
    #[serde(default)]
    pub scopes: String,
    pub grant_type: GetTokenAuthRequestGrantType,
    #[serde(default)]
    pub tenant: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_hint: Option<String>,
    #[serde(skip)]
    pub audience: Option<GetTokenAuthRequestAudience>,
}

impl GetTokenAuthRequest {
    pub fn builder() -> GetTokenAuthRequestBuilder {
        <GetTokenAuthRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetTokenAuthRequestBuilder {
    client_id: Option<String>,
    client_secret: Option<String>,
    scopes: Option<String>,
    grant_type: Option<GetTokenAuthRequestGrantType>,
    tenant: Option<String>,
    optional_hint: Option<String>,
    audience: Option<GetTokenAuthRequestAudience>,
}

impl GetTokenAuthRequestBuilder {
    pub fn client_id(mut self, value: impl Into<String>) -> Self {
        self.client_id = Some(value.into());
        self
    }

    pub fn client_secret(mut self, value: impl Into<String>) -> Self {
        self.client_secret = Some(value.into());
        self
    }

    pub fn scopes(mut self, value: impl Into<String>) -> Self {
        self.scopes = Some(value.into());
        self
    }

    pub fn grant_type(mut self, value: GetTokenAuthRequestGrantType) -> Self {
        self.grant_type = Some(value);
        self
    }

    pub fn tenant(mut self, value: impl Into<String>) -> Self {
        self.tenant = Some(value.into());
        self
    }

    pub fn optional_hint(mut self, value: impl Into<String>) -> Self {
        self.optional_hint = Some(value.into());
        self
    }

    pub fn audience(mut self, value: GetTokenAuthRequestAudience) -> Self {
        self.audience = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetTokenAuthRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`client_id`](GetTokenAuthRequestBuilder::client_id)
    /// - [`client_secret`](GetTokenAuthRequestBuilder::client_secret)
    /// - [`scopes`](GetTokenAuthRequestBuilder::scopes)
    /// - [`grant_type`](GetTokenAuthRequestBuilder::grant_type)
    /// - [`tenant`](GetTokenAuthRequestBuilder::tenant)
    pub fn build(self) -> Result<GetTokenAuthRequest, BuildError> {
        Ok(GetTokenAuthRequest {
            client_id: self
                .client_id
                .ok_or_else(|| BuildError::missing_field("client_id"))?,
            client_secret: self
                .client_secret
                .ok_or_else(|| BuildError::missing_field("client_secret"))?,
            scopes: self
                .scopes
                .ok_or_else(|| BuildError::missing_field("scopes"))?,
            grant_type: self
                .grant_type
                .ok_or_else(|| BuildError::missing_field("grant_type"))?,
            tenant: self
                .tenant
                .ok_or_else(|| BuildError::missing_field("tenant"))?,
            optional_hint: self.optional_hint,
            audience: self.audience,
        })
    }
}
