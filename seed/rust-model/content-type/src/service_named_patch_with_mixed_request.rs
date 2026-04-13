pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ServiceNamedPatchWithMixedRequest {
    #[serde(rename = "appId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instructions: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active: Option<bool>,
}

impl ServiceNamedPatchWithMixedRequest {
    pub fn builder() -> ServiceNamedPatchWithMixedRequestBuilder {
        <ServiceNamedPatchWithMixedRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ServiceNamedPatchWithMixedRequestBuilder {
    app_id: Option<String>,
    instructions: Option<String>,
    active: Option<bool>,
}

impl ServiceNamedPatchWithMixedRequestBuilder {
    pub fn app_id(mut self, value: impl Into<String>) -> Self {
        self.app_id = Some(value.into());
        self
    }

    pub fn instructions(mut self, value: impl Into<String>) -> Self {
        self.instructions = Some(value.into());
        self
    }

    pub fn active(mut self, value: bool) -> Self {
        self.active = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ServiceNamedPatchWithMixedRequest`].
    pub fn build(self) -> Result<ServiceNamedPatchWithMixedRequest, BuildError> {
        Ok(ServiceNamedPatchWithMixedRequest {
            app_id: self.app_id,
            instructions: self.instructions,
            active: self.active,
        })
    }
}

