pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SingleFilterSearchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub operator: Option<SingleFilterSearchRequestOperator>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
}

impl SingleFilterSearchRequest {
    pub fn builder() -> SingleFilterSearchRequestBuilder {
        <SingleFilterSearchRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SingleFilterSearchRequestBuilder {
    field: Option<String>,
    operator: Option<SingleFilterSearchRequestOperator>,
    value: Option<String>,
}

impl SingleFilterSearchRequestBuilder {
    pub fn field(mut self, value: impl Into<String>) -> Self {
        self.field = Some(value.into());
        self
    }

    pub fn operator(mut self, value: SingleFilterSearchRequestOperator) -> Self {
        self.operator = Some(value);
        self
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SingleFilterSearchRequest`].
    pub fn build(self) -> Result<SingleFilterSearchRequest, BuildError> {
        Ok(SingleFilterSearchRequest {
            field: self.field,
            operator: self.operator,
            value: self.value,
        })
    }
}
