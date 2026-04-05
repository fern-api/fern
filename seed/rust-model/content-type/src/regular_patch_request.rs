pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RegularPatchRequest {
    #[serde(rename = "field1")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field_1: Option<String>,
    #[serde(rename = "field2")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field_2: Option<i64>,
}

impl RegularPatchRequest {
    pub fn builder() -> RegularPatchRequestBuilder {
        <RegularPatchRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RegularPatchRequestBuilder {
    field_1: Option<String>,
    field_2: Option<i64>,
}

impl RegularPatchRequestBuilder {
    pub fn field_1(mut self, value: impl Into<String>) -> Self {
        self.field_1 = Some(value.into());
        self
    }

    pub fn field_2(mut self, value: i64) -> Self {
        self.field_2 = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RegularPatchRequest`].
    pub fn build(self) -> Result<RegularPatchRequest, BuildError> {
        Ok(RegularPatchRequest {
            field_1: self.field_1,
            field_2: self.field_2,
        })
    }
}

