pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

/// Query parameters for list
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListQueryRequest {
    /// Filter by message direction.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub direction: Option<ListMessagesRequestDirection>,
}

impl ListQueryRequest {
    pub fn builder() -> ListQueryRequestBuilder {
        <ListQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListQueryRequestBuilder {
    direction: Option<ListMessagesRequestDirection>,
}

impl ListQueryRequestBuilder {
    pub fn direction(mut self, value: ListMessagesRequestDirection) -> Self {
        self.direction = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListQueryRequest`].
    pub fn build(self) -> Result<ListQueryRequest, BuildError> {
        Ok(ListQueryRequest {
            direction: self.direction,
        })
    }
}

