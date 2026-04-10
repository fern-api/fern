pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ServicePatchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub application: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub require_auth: Option<bool>,
}

impl ServicePatchRequest {
    pub fn builder() -> ServicePatchRequestBuilder {
        <ServicePatchRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ServicePatchRequestBuilder {
    application: Option<String>,
    require_auth: Option<bool>,
}

impl ServicePatchRequestBuilder {
    pub fn application(mut self, value: impl Into<String>) -> Self {
        self.application = Some(value.into());
        self
    }

    pub fn require_auth(mut self, value: bool) -> Self {
        self.require_auth = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ServicePatchRequest`].
    pub fn build(self) -> Result<ServicePatchRequest, BuildError> {
        Ok(ServicePatchRequest {
            application: self.application,
            require_auth: self.require_auth,
        })
    }
}

