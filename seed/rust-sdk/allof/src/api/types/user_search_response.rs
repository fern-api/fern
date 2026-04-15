pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserSearchResponse {
    /// Current page of results from the requested resource.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub results: Option<Vec<User>>,
    #[serde(default)]
    pub paging: PagingCursors,
}

impl UserSearchResponse {
    pub fn builder() -> UserSearchResponseBuilder {
        <UserSearchResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserSearchResponseBuilder {
    results: Option<Vec<User>>,
    paging: Option<PagingCursors>,
}

impl UserSearchResponseBuilder {
    pub fn results(mut self, value: Vec<User>) -> Self {
        self.results = Some(value);
        self
    }

    pub fn paging(mut self, value: PagingCursors) -> Self {
        self.paging = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserSearchResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`paging`](UserSearchResponseBuilder::paging)
    pub fn build(self) -> Result<UserSearchResponse, BuildError> {
        Ok(UserSearchResponse {
            results: self.results,
            paging: self
                .paging
                .ok_or_else(|| BuildError::missing_field("paging"))?,
        })
    }
}
