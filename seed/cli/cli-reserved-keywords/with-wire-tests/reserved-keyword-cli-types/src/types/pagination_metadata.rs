pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PaginationMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
    #[serde(rename = "self")]
    #[serde(default)]
    pub self_: String,
    #[serde(rename = "crate")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub crate_: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#move: Option<String>,
}

impl PaginationMetadata {
    pub fn builder() -> PaginationMetadataBuilder {
        <PaginationMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaginationMetadataBuilder {
    next: Option<String>,
    self_: Option<String>,
    crate_: Option<String>,
    r#type: Option<String>,
    r#move: Option<String>,
}

impl PaginationMetadataBuilder {
    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    pub fn self_(mut self, value: impl Into<String>) -> Self {
        self.self_ = Some(value.into());
        self
    }

    pub fn crate_(mut self, value: impl Into<String>) -> Self {
        self.crate_ = Some(value.into());
        self
    }

    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn r#move(mut self, value: impl Into<String>) -> Self {
        self.r#move = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PaginationMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`self_`](PaginationMetadataBuilder::self_)
    pub fn build(self) -> Result<PaginationMetadata, BuildError> {
        Ok(PaginationMetadata {
            next: self.next,
            self_: self.self_.ok_or_else(|| BuildError::missing_field("self_"))?,
            crate_: self.crate_,
            r#type: self.r#type,
            r#move: self.r#move,
        })
    }
}
