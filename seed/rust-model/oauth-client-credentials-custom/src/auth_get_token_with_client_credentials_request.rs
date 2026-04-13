pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct AuthGetTokenWithClientCredentialsRequest {
    #[serde(default)]
    pub cid: String,
    #[serde(default)]
    pub csr: String,
    #[serde(default)]
    pub scp: String,
    #[serde(default)]
    pub entity_id: String,
    pub audience: AuthGetTokenWithClientCredentialsRequestAudience,
    pub grant_type: AuthGetTokenWithClientCredentialsRequestGrantType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
}

impl AuthGetTokenWithClientCredentialsRequest {
    pub fn builder() -> AuthGetTokenWithClientCredentialsRequestBuilder {
        <AuthGetTokenWithClientCredentialsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AuthGetTokenWithClientCredentialsRequestBuilder {
    cid: Option<String>,
    csr: Option<String>,
    scp: Option<String>,
    entity_id: Option<String>,
    audience: Option<AuthGetTokenWithClientCredentialsRequestAudience>,
    grant_type: Option<AuthGetTokenWithClientCredentialsRequestGrantType>,
    scope: Option<String>,
}

impl AuthGetTokenWithClientCredentialsRequestBuilder {
    pub fn cid(mut self, value: impl Into<String>) -> Self {
        self.cid = Some(value.into());
        self
    }

    pub fn csr(mut self, value: impl Into<String>) -> Self {
        self.csr = Some(value.into());
        self
    }

    pub fn scp(mut self, value: impl Into<String>) -> Self {
        self.scp = Some(value.into());
        self
    }

    pub fn entity_id(mut self, value: impl Into<String>) -> Self {
        self.entity_id = Some(value.into());
        self
    }

    pub fn audience(mut self, value: AuthGetTokenWithClientCredentialsRequestAudience) -> Self {
        self.audience = Some(value);
        self
    }

    pub fn grant_type(mut self, value: AuthGetTokenWithClientCredentialsRequestGrantType) -> Self {
        self.grant_type = Some(value);
        self
    }

    pub fn scope(mut self, value: impl Into<String>) -> Self {
        self.scope = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AuthGetTokenWithClientCredentialsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`cid`](AuthGetTokenWithClientCredentialsRequestBuilder::cid)
    /// - [`csr`](AuthGetTokenWithClientCredentialsRequestBuilder::csr)
    /// - [`scp`](AuthGetTokenWithClientCredentialsRequestBuilder::scp)
    /// - [`entity_id`](AuthGetTokenWithClientCredentialsRequestBuilder::entity_id)
    /// - [`audience`](AuthGetTokenWithClientCredentialsRequestBuilder::audience)
    /// - [`grant_type`](AuthGetTokenWithClientCredentialsRequestBuilder::grant_type)
    pub fn build(self) -> Result<AuthGetTokenWithClientCredentialsRequest, BuildError> {
        Ok(AuthGetTokenWithClientCredentialsRequest {
            cid: self.cid.ok_or_else(|| BuildError::missing_field("cid"))?,
            csr: self.csr.ok_or_else(|| BuildError::missing_field("csr"))?,
            scp: self.scp.ok_or_else(|| BuildError::missing_field("scp"))?,
            entity_id: self.entity_id.ok_or_else(|| BuildError::missing_field("entity_id"))?,
            audience: self.audience.ok_or_else(|| BuildError::missing_field("audience"))?,
            grant_type: self.grant_type.ok_or_else(|| BuildError::missing_field("grant_type"))?,
            scope: self.scope,
        })
    }
}

