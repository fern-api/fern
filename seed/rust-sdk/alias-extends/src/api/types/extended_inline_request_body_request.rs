pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ExtendedInlineRequestBodyRequest {
    #[serde(default)]
    pub child: String,
    #[serde(default)]
    pub parent: String,
}

impl ExtendedInlineRequestBodyRequest {
    pub fn builder() -> ExtendedInlineRequestBodyRequestBuilder {
        <ExtendedInlineRequestBodyRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExtendedInlineRequestBodyRequestBuilder {
    child: Option<String>,
    parent: Option<String>,
}

impl ExtendedInlineRequestBodyRequestBuilder {
    pub fn child(mut self, value: impl Into<String>) -> Self {
        self.child = Some(value.into());
        self
    }

    pub fn parent(mut self, value: impl Into<String>) -> Self {
        self.parent = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ExtendedInlineRequestBodyRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`child`](ExtendedInlineRequestBodyRequestBuilder::child)
    /// - [`parent`](ExtendedInlineRequestBodyRequestBuilder::parent)
    pub fn build(self) -> Result<ExtendedInlineRequestBodyRequest, BuildError> {
        Ok(ExtendedInlineRequestBodyRequest {
            child: self.child.ok_or_else(|| BuildError::missing_field("child"))?,
            parent: self.parent.ok_or_else(|| BuildError::missing_field("parent"))?,
        })
    }
}

