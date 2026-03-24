pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct OptionalMergePatchRequest {
    #[serde(rename = "requiredField")]
    #[serde(default)]
    pub required_field: String,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "optionalInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_integer: Option<i64>,
    #[serde(rename = "optionalBoolean")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_boolean: Option<bool>,
    #[serde(rename = "nullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_string: Option<String>,
}

impl OptionalMergePatchRequest {
    pub fn builder() -> OptionalMergePatchRequestBuilder {
        OptionalMergePatchRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct OptionalMergePatchRequestBuilder {
    required_field: Option<String>,
    optional_string: Option<String>,
    optional_integer: Option<i64>,
    optional_boolean: Option<bool>,
    nullable_string: Option<String>,
}

impl OptionalMergePatchRequestBuilder {
    pub fn required_field(mut self, value: impl Into<String>) -> Self {
        self.required_field = Some(value.into());
        self
    }

    pub fn optional_string(mut self, value: impl Into<String>) -> Self {
        self.optional_string = Some(value.into());
        self
    }

    pub fn optional_integer(mut self, value: i64) -> Self {
        self.optional_integer = Some(value);
        self
    }

    pub fn optional_boolean(mut self, value: bool) -> Self {
        self.optional_boolean = Some(value);
        self
    }

    pub fn nullable_string(mut self, value: impl Into<String>) -> Self {
        self.nullable_string = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`OptionalMergePatchRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`required_field`](OptionalMergePatchRequestBuilder::required_field)
    pub fn build(self) -> Result<OptionalMergePatchRequest, BuildError> {
        Ok(OptionalMergePatchRequest {
            required_field: self.required_field.ok_or_else(|| BuildError::missing_field("required_field"))?,
            optional_string: self.optional_string,
            optional_integer: self.optional_integer,
            optional_boolean: self.optional_boolean,
            nullable_string: self.nullable_string,
        })
    }
}

