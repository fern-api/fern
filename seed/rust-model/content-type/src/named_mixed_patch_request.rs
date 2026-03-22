pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NamedMixedPatchRequest {
    #[serde(rename = "appId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instructions: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active: Option<bool>,
}

impl NamedMixedPatchRequest {
    pub fn builder() -> NamedMixedPatchRequestBuilder {
        NamedMixedPatchRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NamedMixedPatchRequestBuilder {
    app_id: Option<String>,
    instructions: Option<String>,
    active: Option<bool>,
}

impl NamedMixedPatchRequestBuilder {
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

    /// Consumes the builder and constructs a [`NamedMixedPatchRequest`].
    pub fn build(self) -> Result<NamedMixedPatchRequest, BuildError> {
        Ok(NamedMixedPatchRequest {
            app_id: self.app_id,
            instructions: self.instructions,
            active: self.active,
        })
    }
}

