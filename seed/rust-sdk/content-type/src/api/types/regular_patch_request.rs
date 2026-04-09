pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RegularPatchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field1: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field2: Option<i64>,
}

impl RegularPatchRequest {
    pub fn builder() -> RegularPatchRequestBuilder {
        <RegularPatchRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RegularPatchRequestBuilder {
    field1: Option<String>,
    field2: Option<i64>,
}

impl RegularPatchRequestBuilder {
    pub fn field1(mut self, value: impl Into<String>) -> Self {
        self.field1 = Some(value.into());
        self
    }

    pub fn field2(mut self, value: i64) -> Self {
        self.field2 = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RegularPatchRequest`].
    pub fn build(self) -> Result<RegularPatchRequest, BuildError> {
        Ok(RegularPatchRequest {
            field1: self.field1,
            field2: self.field2,
        })
    }
}
