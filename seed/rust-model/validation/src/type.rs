pub use crate::prelude::*;

/// Defines properties with default values and validation rules.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Type {
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers")]
    pub decimal: f64,
    #[serde(default)]
    pub even: i64,
    #[serde(default)]
    pub name: String,
    pub shape: Shape,
}

impl Type {
    pub fn builder() -> TypeBuilder {
        <TypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypeBuilder {
    decimal: Option<f64>,
    even: Option<i64>,
    name: Option<String>,
    shape: Option<Shape>,
}

impl TypeBuilder {
    pub fn decimal(mut self, value: f64) -> Self {
        self.decimal = Some(value);
        self
    }

    pub fn even(mut self, value: i64) -> Self {
        self.even = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn shape(mut self, value: Shape) -> Self {
        self.shape = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Type`].
    /// This method will fail if any of the following fields are not set:
    /// - [`decimal`](TypeBuilder::decimal)
    /// - [`even`](TypeBuilder::even)
    /// - [`name`](TypeBuilder::name)
    /// - [`shape`](TypeBuilder::shape)
    pub fn build(self) -> Result<Type, BuildError> {
        Ok(Type {
            decimal: self.decimal.ok_or_else(|| BuildError::missing_field("decimal"))?,
            even: self.even.ok_or_else(|| BuildError::missing_field("even"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            shape: self.shape.ok_or_else(|| BuildError::missing_field("shape"))?,
        })
    }
}
