pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetTokenRequest {
    #[serde(default)]
    pub cid: String,
    #[serde(default)]
    pub csr: String,
    #[serde(default)]
    pub scp: String,
    #[serde(default)]
    pub entity_id: String,
    pub audience: String,
    pub grant_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
}

impl GetTokenRequest {
    pub fn builder() -> GetTokenRequestBuilder {
        GetTokenRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetTokenRequestBuilder {
    cid: Option<String>,
    csr: Option<String>,
    scp: Option<String>,
    entity_id: Option<String>,
    audience: Option<String>,
    grant_type: Option<String>,
    scope: Option<String>,
}

impl GetTokenRequestBuilder {
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

    pub fn audience(mut self, value: impl Into<String>) -> Self {
        self.audience = Some(value.into());
        self
    }

    pub fn grant_type(mut self, value: impl Into<String>) -> Self {
        self.grant_type = Some(value.into());
        self
    }

    pub fn scope(mut self, value: impl Into<String>) -> Self {
        self.scope = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetTokenRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`cid`](GetTokenRequestBuilder::cid)
    /// - [`csr`](GetTokenRequestBuilder::csr)
    /// - [`scp`](GetTokenRequestBuilder::scp)
    /// - [`entity_id`](GetTokenRequestBuilder::entity_id)
    /// - [`audience`](GetTokenRequestBuilder::audience)
    /// - [`grant_type`](GetTokenRequestBuilder::grant_type)
    pub fn build(self) -> Result<GetTokenRequest, BuildError> {
        Ok(GetTokenRequest {
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

