pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BulkUpdateTasksResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_count: Option<i64>,
}

impl BulkUpdateTasksResponse {
    pub fn builder() -> BulkUpdateTasksResponseBuilder {
        BulkUpdateTasksResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BulkUpdateTasksResponseBuilder {
    updated_count: Option<i64>,
}

impl BulkUpdateTasksResponseBuilder {
    pub fn updated_count(mut self, value: i64) -> Self {
        self.updated_count = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BulkUpdateTasksResponse`].
    pub fn build(self) -> Result<BulkUpdateTasksResponse, BuildError> {
        Ok(BulkUpdateTasksResponse {
            updated_count: self.updated_count,
        })
    }
}
