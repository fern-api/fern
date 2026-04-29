pub use crate::prelude::*;

/// Query parameters for subscribe
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SubscribeQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_type: Option<EventTypeParam>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<StringOrListParam>,
}

impl SubscribeQueryRequest {
    pub fn builder() -> SubscribeQueryRequestBuilder {
        <SubscribeQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubscribeQueryRequestBuilder {
    event_type: Option<EventTypeParam>,
    tags: Option<StringOrListParam>,
}

impl SubscribeQueryRequestBuilder {
    pub fn event_type(mut self, value: EventTypeParam) -> Self {
        self.event_type = Some(value);
        self
    }

    pub fn tags(mut self, value: StringOrListParam) -> Self {
        self.tags = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubscribeQueryRequest`].
    pub fn build(self) -> Result<SubscribeQueryRequest, BuildError> {
        Ok(SubscribeQueryRequest {
            event_type: self.event_type,
            tags: self.tags,
        })
    }
}
