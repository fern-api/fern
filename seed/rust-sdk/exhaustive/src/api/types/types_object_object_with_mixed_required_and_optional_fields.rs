pub use crate::prelude::*;

/// Tests that dynamic snippets include all required properties even when
/// the example data only provides a subset. In C#, properties marked as
/// `required` must be set in the object initializer.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ObjectWithMixedRequiredAndOptionalFields {
    #[serde(rename = "requiredString")]
    #[serde(default)]
    pub required_string: String,
    #[serde(rename = "requiredInteger")]
    #[serde(default)]
    pub required_integer: i64,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "requiredLong")]
    #[serde(default)]
    pub required_long: i64,
}

impl ObjectWithMixedRequiredAndOptionalFields {
    pub fn builder() -> ObjectWithMixedRequiredAndOptionalFieldsBuilder {
        <ObjectWithMixedRequiredAndOptionalFieldsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithMixedRequiredAndOptionalFieldsBuilder {
    required_string: Option<String>,
    required_integer: Option<i64>,
    optional_string: Option<String>,
    required_long: Option<i64>,
}

impl ObjectWithMixedRequiredAndOptionalFieldsBuilder {
    pub fn required_string(mut self, value: impl Into<String>) -> Self {
        self.required_string = Some(value.into());
        self
    }

    pub fn required_integer(mut self, value: i64) -> Self {
        self.required_integer = Some(value);
        self
    }

    pub fn optional_string(mut self, value: impl Into<String>) -> Self {
        self.optional_string = Some(value.into());
        self
    }

    pub fn required_long(mut self, value: i64) -> Self {
        self.required_long = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithMixedRequiredAndOptionalFields`].
    /// This method will fail if any of the following fields are not set:
    /// - [`required_string`](ObjectWithMixedRequiredAndOptionalFieldsBuilder::required_string)
    /// - [`required_integer`](ObjectWithMixedRequiredAndOptionalFieldsBuilder::required_integer)
    /// - [`required_long`](ObjectWithMixedRequiredAndOptionalFieldsBuilder::required_long)
    pub fn build(self) -> Result<ObjectWithMixedRequiredAndOptionalFields, BuildError> {
        Ok(ObjectWithMixedRequiredAndOptionalFields {
            required_string: self
                .required_string
                .ok_or_else(|| BuildError::missing_field("required_string"))?,
            required_integer: self
                .required_integer
                .ok_or_else(|| BuildError::missing_field("required_integer"))?,
            optional_string: self.optional_string,
            required_long: self
                .required_long
                .ok_or_else(|| BuildError::missing_field("required_long"))?,
        })
    }
}
