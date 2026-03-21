pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetTraceResponsesPageRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
}

impl GetTraceResponsesPageRequest {
    pub fn builder() -> GetTraceResponsesPageRequestBuilder {
        GetTraceResponsesPageRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetTraceResponsesPageRequestBuilder {
    offset: Option<i64>,
}

impl GetTraceResponsesPageRequestBuilder {
    pub fn offset(mut self, value: i64) -> Self {
        self.offset = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetTraceResponsesPageRequest`].
    pub fn build(self) -> Result<GetTraceResponsesPageRequest, BuildError> {
        Ok(GetTraceResponsesPageRequest {
            offset: self.offset,
        })
    }
}
