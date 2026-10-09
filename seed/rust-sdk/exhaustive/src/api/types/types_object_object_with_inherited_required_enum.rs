pub use crate::prelude::*;

/// A base object that has a required enum field, preventing Default derive
/// in Rust because enums don't implement Default.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ObjectWithInheritedRequiredEnum {
    #[serde(rename = "requiredEnum")]
    pub required_enum: WeatherReport,
    #[serde(rename = "requiredString")]
    #[serde(default)]
    pub required_string: String,
}

impl ObjectWithInheritedRequiredEnum {
    pub fn builder() -> ObjectWithInheritedRequiredEnumBuilder {
        <ObjectWithInheritedRequiredEnumBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithInheritedRequiredEnumBuilder {
    required_enum: Option<WeatherReport>,
    required_string: Option<String>,
}

impl ObjectWithInheritedRequiredEnumBuilder {
    pub fn required_enum(mut self, value: WeatherReport) -> Self {
        self.required_enum = Some(value);
        self
    }

    pub fn required_string(mut self, value: impl Into<String>) -> Self {
        self.required_string = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithInheritedRequiredEnum`].
    /// This method will fail if any of the following fields are not set:
    /// - [`required_enum`](ObjectWithInheritedRequiredEnumBuilder::required_enum)
    /// - [`required_string`](ObjectWithInheritedRequiredEnumBuilder::required_string)
    pub fn build(self) -> Result<ObjectWithInheritedRequiredEnum, BuildError> {
        Ok(ObjectWithInheritedRequiredEnum {
            required_enum: self
                .required_enum
                .ok_or_else(|| BuildError::missing_field("required_enum"))?,
            required_string: self
                .required_string
                .ok_or_else(|| BuildError::missing_field("required_string"))?,
        })
    }
}
