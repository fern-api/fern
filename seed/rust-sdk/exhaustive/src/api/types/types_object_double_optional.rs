pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DoubleOptional {
    #[serde(rename = "optionalAlias")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_alias: Option<OptionalAlias>,
}

impl DoubleOptional {
    pub fn builder() -> DoubleOptionalBuilder {
        DoubleOptionalBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DoubleOptionalBuilder {
    optional_alias: Option<OptionalAlias>,
}

impl DoubleOptionalBuilder {
    pub fn optional_alias(mut self, value: OptionalAlias) -> Self {
        self.optional_alias = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DoubleOptional`].
    pub fn build(self) -> Result<DoubleOptional, BuildError> {
        Ok(DoubleOptional {
            optional_alias: self.optional_alias,
        })
    }
}
