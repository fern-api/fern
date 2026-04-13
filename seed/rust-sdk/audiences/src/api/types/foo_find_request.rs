pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FooFindRequest {
    #[serde(rename = "publicProperty")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_property: Option<String>,
    #[serde(rename = "privateProperty")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub private_property: Option<i64>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing)]
    pub optional_string: Option<OptionalString>,
}

impl FooFindRequest {
    pub fn builder() -> FooFindRequestBuilder {
        <FooFindRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FooFindRequestBuilder {
    public_property: Option<String>,
    private_property: Option<i64>,
    optional_string: Option<OptionalString>,
}

impl FooFindRequestBuilder {
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

    /// Consumes the builder and constructs a [`FooFindRequest`].
    pub fn build(self) -> Result<FooFindRequest, BuildError> {
        Ok(FooFindRequest {
            public_property: self.public_property,
            private_property: self.private_property,
            optional_string: self.optional_string,
        })
    }
}
