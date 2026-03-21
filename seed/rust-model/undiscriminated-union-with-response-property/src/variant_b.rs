pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariantB {
    pub r#type: String,
    #[serde(rename = "valueB")]
    #[serde(default)]
    pub value_b: i64,
}

impl VariantB {
    pub fn builder() -> VariantBBuilder {
        VariantBBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariantBBuilder {
    r#type: Option<String>,
    value_b: Option<i64>,
}

impl VariantBBuilder {
    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn value_b(mut self, value: i64) -> Self {
        self.value_b = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariantB`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariantBBuilder::r#type)
    /// - [`value_b`](VariantBBuilder::value_b)
    pub fn build(self) -> Result<VariantB, BuildError> {
        Ok(VariantB {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value_b: self.value_b.ok_or_else(|| BuildError::missing_field("value_b"))?,
        })
    }
}
