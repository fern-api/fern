pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersMixedTypePaginationResponse {
    #[serde(default)]
    pub next: String,
    #[serde(default)]
    pub data: Users,
}

impl ListUsersMixedTypePaginationResponse {
    pub fn builder() -> ListUsersMixedTypePaginationResponseBuilder {
        ListUsersMixedTypePaginationResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersMixedTypePaginationResponseBuilder {
    next: Option<String>,
    data: Option<Users>,
}

impl ListUsersMixedTypePaginationResponseBuilder {
    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    pub fn data(mut self, value: Users) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersMixedTypePaginationResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`next`](ListUsersMixedTypePaginationResponseBuilder::next)
    /// - [`data`](ListUsersMixedTypePaginationResponseBuilder::data)
    pub fn build(self) -> Result<ListUsersMixedTypePaginationResponse, BuildError> {
        Ok(ListUsersMixedTypePaginationResponse {
            next: self.next.ok_or_else(|| BuildError::missing_field("next"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
