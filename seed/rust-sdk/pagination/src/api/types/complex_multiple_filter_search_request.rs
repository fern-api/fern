pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct MultipleFilterSearchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub operator: Option<MultipleFilterSearchRequestOperator>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<Box<MultipleFilterSearchRequestValue>>,
}

impl MultipleFilterSearchRequest {
    pub fn builder() -> MultipleFilterSearchRequestBuilder {
        MultipleFilterSearchRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MultipleFilterSearchRequestBuilder {
    operator: Option<MultipleFilterSearchRequestOperator>,
    value: Option<Box<MultipleFilterSearchRequestValue>>,
}

impl MultipleFilterSearchRequestBuilder {
    pub fn operator(mut self, value: MultipleFilterSearchRequestOperator) -> Self {
        self.operator = Some(value);
        self
    }

    pub fn value(mut self, value: Box<MultipleFilterSearchRequestValue>) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`MultipleFilterSearchRequest`].
    pub fn build(self) -> Result<MultipleFilterSearchRequest, BuildError> {
        Ok(MultipleFilterSearchRequest {
            operator: self.operator,
            value: self.value,
        })
    }
}
