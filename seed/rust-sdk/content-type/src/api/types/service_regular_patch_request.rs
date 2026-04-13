pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ServiceRegularPatchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field1: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field2: Option<i64>,
}

impl ServiceRegularPatchRequest {
    pub fn builder() -> ServiceRegularPatchRequestBuilder {
        <ServiceRegularPatchRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ServiceRegularPatchRequestBuilder {
    field1: Option<String>,
    field2: Option<i64>,
}

impl ServiceRegularPatchRequestBuilder {
    pub fn field1(mut self, value: impl Into<String>) -> Self {
        self.field1 = Some(value.into());
        self
    }

    pub fn field2(mut self, value: i64) -> Self {
        self.field2 = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ServiceRegularPatchRequest`].
    pub fn build(self) -> Result<ServiceRegularPatchRequest, BuildError> {
        Ok(ServiceRegularPatchRequest {
            field1: self.field1,
            field2: self.field2,
        })
    }
}
