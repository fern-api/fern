pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FindRequest {
    #[serde(rename = "publicProperty")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_property: Option<String>,
    #[serde(rename = "privateProperty")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub private_property: Option<i64>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing)]
    #[serde(default)]
    pub optional_string: OptionalString,
}

impl FindRequest {
    pub fn builder() -> FindRequestBuilder {
        <FindRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FindRequestBuilder {
    public_property: Option<String>,
    private_property: Option<i64>,
    optional_string: Option<OptionalString>,
}

impl FindRequestBuilder {
    pub fn public_property(mut self, value: impl Into<String>) -> Self {
        self.public_property = Some(value.into());
        self
    }

    pub fn private_property(mut self, value: i64) -> Self {
        self.private_property = Some(value);
        self
    }

    pub fn optional_string(mut self, value: OptionalString) -> Self {
        self.optional_string = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FindRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`optional_string`](FindRequestBuilder::optional_string)
    pub fn build(self) -> Result<FindRequest, BuildError> {
        Ok(FindRequest {
            public_property: self.public_property,
            private_property: self.private_property,
            optional_string: self.optional_string.ok_or_else(|| BuildError::missing_field("optional_string"))?,
        })
    }
}

