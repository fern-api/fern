pub use crate::prelude::*;

/// Query parameters for listWithExtendedResultsAndOptionalData
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithExtendedResultsAndOptionalDataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<Uuid>,
}

impl UsersListWithExtendedResultsAndOptionalDataQueryRequest {
    pub fn builder() -> UsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder {
        UsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder {
    cursor: Option<Uuid>,
}

impl UsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder {
    pub fn cursor(mut self, value: Uuid) -> Self {
        self.cursor = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsersListWithExtendedResultsAndOptionalDataQueryRequest`].
    pub fn build(self) -> Result<UsersListWithExtendedResultsAndOptionalDataQueryRequest, BuildError> {
        Ok(UsersListWithExtendedResultsAndOptionalDataQueryRequest {
            cursor: self.cursor,
        })
    }
}

