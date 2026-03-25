pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PaginatedResponse {
    #[serde(default)]
    pub items: Vec<ObjectWithRequiredField>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
}

impl PaginatedResponse {
    pub fn builder() -> PaginatedResponseBuilder {
        PaginatedResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaginatedResponseBuilder {
    items: Option<Vec<ObjectWithRequiredField>>,
    next: Option<String>,
}

impl PaginatedResponseBuilder {
    pub fn items(mut self, value: Vec<ObjectWithRequiredField>) -> Self {
        self.items = Some(value);
        self
    }

    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PaginatedResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`items`](PaginatedResponseBuilder::items)
    pub fn build(self) -> Result<PaginatedResponse, BuildError> {
        Ok(PaginatedResponse {
            items: self
                .items
                .ok_or_else(|| BuildError::missing_field("items"))?,
            next: self.next,
        })
    }
}
