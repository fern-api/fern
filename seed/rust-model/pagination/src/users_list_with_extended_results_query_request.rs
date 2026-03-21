pub use crate::prelude::*;

/// Query parameters for listWithExtendedResults
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithExtendedResultsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<Uuid>,
}

impl UsersListWithExtendedResultsQueryRequest {
    pub fn builder() -> UsersListWithExtendedResultsQueryRequestBuilder {
        UsersListWithExtendedResultsQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListWithExtendedResultsQueryRequestBuilder {
    cursor: Option<Uuid>,
}

impl UsersListWithExtendedResultsQueryRequestBuilder {
    pub fn cursor(mut self, value: Uuid) -> Self {
        self.cursor = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsersListWithExtendedResultsQueryRequest`].
    pub fn build(self) -> Result<UsersListWithExtendedResultsQueryRequest, BuildError> {
        Ok(UsersListWithExtendedResultsQueryRequest {
            cursor: self.cursor,
        })
    }
}

