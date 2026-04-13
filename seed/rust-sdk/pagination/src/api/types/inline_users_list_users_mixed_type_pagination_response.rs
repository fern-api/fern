pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersListUsersMixedTypePaginationResponse {
    #[serde(default)]
    pub next: String,
    #[serde(default)]
    pub data: InlineUsersUsers,
}

impl InlineUsersListUsersMixedTypePaginationResponse {
    pub fn builder() -> InlineUsersListUsersMixedTypePaginationResponseBuilder {
        <InlineUsersListUsersMixedTypePaginationResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersListUsersMixedTypePaginationResponseBuilder {
    next: Option<String>,
    data: Option<InlineUsersUsers>,
}

impl InlineUsersListUsersMixedTypePaginationResponseBuilder {
    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    pub fn data(mut self, value: InlineUsersUsers) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersListUsersMixedTypePaginationResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`next`](InlineUsersListUsersMixedTypePaginationResponseBuilder::next)
    /// - [`data`](InlineUsersListUsersMixedTypePaginationResponseBuilder::data)
    pub fn build(self) -> Result<InlineUsersListUsersMixedTypePaginationResponse, BuildError> {
        Ok(InlineUsersListUsersMixedTypePaginationResponse {
            next: self.next.ok_or_else(|| BuildError::missing_field("next"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
