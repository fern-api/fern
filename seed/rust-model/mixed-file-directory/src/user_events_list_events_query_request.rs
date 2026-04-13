pub use crate::prelude::*;

/// Query parameters for user_events_listEvents
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserEventsListEventsQueryRequest {
    /// The maximum number of results to return.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl UserEventsListEventsQueryRequest {
    pub fn builder() -> UserEventsListEventsQueryRequestBuilder {
        <UserEventsListEventsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserEventsListEventsQueryRequestBuilder {
    limit: Option<i64>,
}

impl UserEventsListEventsQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserEventsListEventsQueryRequest`].
    pub fn build(self) -> Result<UserEventsListEventsQueryRequest, BuildError> {
        Ok(UserEventsListEventsQueryRequest {
            limit: self.limit,
        })
    }
}

