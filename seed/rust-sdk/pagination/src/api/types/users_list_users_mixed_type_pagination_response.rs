pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersMixedTypePaginationResponse2 {
    #[serde(default)]
    pub next: String,
    #[serde(default)]
    pub data: Vec<User2>,
}

impl ListUsersMixedTypePaginationResponse2 {
    pub fn builder() -> ListUsersMixedTypePaginationResponse2Builder {
        ListUsersMixedTypePaginationResponse2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersMixedTypePaginationResponse2Builder {
    next: Option<String>,
    data: Option<Vec<User2>>,
}

impl ListUsersMixedTypePaginationResponse2Builder {
    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    pub fn data(mut self, value: Vec<User2>) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersMixedTypePaginationResponse2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`next`](ListUsersMixedTypePaginationResponse2Builder::next)
    /// - [`data`](ListUsersMixedTypePaginationResponse2Builder::data)
    pub fn build(self) -> Result<ListUsersMixedTypePaginationResponse2, BuildError> {
        Ok(ListUsersMixedTypePaginationResponse2 {
            next: self.next.ok_or_else(|| BuildError::missing_field("next"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
