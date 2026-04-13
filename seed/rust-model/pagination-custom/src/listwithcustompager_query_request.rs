pub use crate::prelude::*;

/// Query parameters for listwithcustompager
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListwithcustompagerQueryRequest {
    /// The maximum number of results to return.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    /// The cursor used for pagination.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl ListwithcustompagerQueryRequest {
    pub fn builder() -> ListwithcustompagerQueryRequestBuilder {
        <ListwithcustompagerQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListwithcustompagerQueryRequestBuilder {
    limit: Option<i64>,
    starting_after: Option<String>,
}

impl ListwithcustompagerQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListwithcustompagerQueryRequest`].
    pub fn build(self) -> Result<ListwithcustompagerQueryRequest, BuildError> {
        Ok(ListwithcustompagerQueryRequest {
            limit: self.limit,
            starting_after: self.starting_after,
        })
    }
}

