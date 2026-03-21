pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlinedChildRequest {
    #[serde(default)]
    pub child: String,
    #[serde(default)]
    pub parent: String,
}

impl InlinedChildRequest {
    pub fn builder() -> InlinedChildRequestBuilder {
        InlinedChildRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlinedChildRequestBuilder {
    child: Option<String>,
    parent: Option<String>,
}

impl InlinedChildRequestBuilder {
    pub fn child(mut self, value: impl Into<String>) -> Self {
        self.child = Some(value.into());
        self
    }

    pub fn parent(mut self, value: impl Into<String>) -> Self {
        self.parent = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`InlinedChildRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`child`](InlinedChildRequestBuilder::child)
    /// - [`parent`](InlinedChildRequestBuilder::parent)
    pub fn build(self) -> Result<InlinedChildRequest, BuildError> {
        Ok(InlinedChildRequest {
            child: self
                .child
                .ok_or_else(|| BuildError::missing_field("child"))?,
            parent: self
                .parent
                .ok_or_else(|| BuildError::missing_field("parent"))?,
        })
    }
}
