pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SearchResultZero {
    #[serde(flatten)]
    pub user_response_fields: UserResponse,
    pub r#type: SearchResultZeroType,
}

impl SearchResultZero {
    pub fn builder() -> SearchResultZeroBuilder {
        <SearchResultZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchResultZeroBuilder {
    user_response_fields: Option<UserResponse>,
    r#type: Option<SearchResultZeroType>,
}

impl SearchResultZeroBuilder {
    pub fn user_response_fields(mut self, value: UserResponse) -> Self {
        self.user_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SearchResultZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchResultZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_response_fields`](SearchResultZeroBuilder::user_response_fields)
    /// - [`r#type`](SearchResultZeroBuilder::r#type)
    pub fn build(self) -> Result<SearchResultZero, BuildError> {
        Ok(SearchResultZero {
            user_response_fields: self.user_response_fields.ok_or_else(|| BuildError::missing_field("user_response_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
