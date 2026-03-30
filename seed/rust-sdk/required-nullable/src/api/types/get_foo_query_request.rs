pub use crate::prelude::*;

/// Query parameters for getFoo
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetFooQueryRequest {
    /// An optional baz
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_baz: Option<String>,
    /// An optional baz
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_baz: Option<String>,
    /// A required baz
    #[serde(default)]
    pub required_baz: String,
    /// A required baz
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required_nullable_baz: Option<String>,
}

impl GetFooQueryRequest {
    pub fn builder() -> GetFooQueryRequestBuilder {
        <GetFooQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetFooQueryRequestBuilder {
    optional_baz: Option<String>,
    optional_nullable_baz: Option<String>,
    required_baz: Option<String>,
    required_nullable_baz: Option<String>,
}

impl GetFooQueryRequestBuilder {
    pub fn optional_baz(mut self, value: impl Into<String>) -> Self {
        self.optional_baz = Some(value.into());
        self
    }

    pub fn optional_nullable_baz(mut self, value: impl Into<String>) -> Self {
        self.optional_nullable_baz = Some(value.into());
        self
    }

    pub fn required_baz(mut self, value: impl Into<String>) -> Self {
        self.required_baz = Some(value.into());
        self
    }

    pub fn required_nullable_baz(mut self, value: impl Into<String>) -> Self {
        self.required_nullable_baz = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetFooQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`required_baz`](GetFooQueryRequestBuilder::required_baz)
    pub fn build(self) -> Result<GetFooQueryRequest, BuildError> {
        Ok(GetFooQueryRequest {
            optional_baz: self.optional_baz,
            optional_nullable_baz: self.optional_nullable_baz,
            required_baz: self
                .required_baz
                .ok_or_else(|| BuildError::missing_field("required_baz"))?,
            required_nullable_baz: self.required_nullable_baz,
        })
    }
}
