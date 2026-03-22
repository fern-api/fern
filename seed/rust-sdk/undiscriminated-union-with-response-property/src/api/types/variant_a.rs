pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariantA {
    pub r#type: String,
    #[serde(rename = "valueA")]
    #[serde(default)]
    pub value_a: String,
}

impl VariantA {
    pub fn builder() -> VariantABuilder {
        VariantABuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariantABuilder {
    r#type: Option<String>,
    value_a: Option<String>,
}

impl VariantABuilder {
    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn value_a(mut self, value: impl Into<String>) -> Self {
        self.value_a = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`VariantA`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariantABuilder::r#type)
    /// - [`value_a`](VariantABuilder::value_a)
    pub fn build(self) -> Result<VariantA, BuildError> {
        Ok(VariantA {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value_a: self
                .value_a
                .ok_or_else(|| BuildError::missing_field("value_a"))?,
        })
    }
}
