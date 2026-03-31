pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariantC {
    pub r#type: String,
    #[serde(rename = "valueC")]
    #[serde(default)]
    pub value_c: bool,
}

impl VariantC {
    pub fn builder() -> VariantCBuilder {
        <VariantCBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariantCBuilder {
    r#type: Option<String>,
    value_c: Option<bool>,
}

impl VariantCBuilder {
    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn value_c(mut self, value: bool) -> Self {
        self.value_c = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariantC`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariantCBuilder::r#type)
    /// - [`value_c`](VariantCBuilder::value_c)
    pub fn build(self) -> Result<VariantC, BuildError> {
        Ok(VariantC {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value_c: self.value_c.ok_or_else(|| BuildError::missing_field("value_c"))?,
        })
    }
}
