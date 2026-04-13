pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithBasePropertiesOne {
    pub r#type: UnionWithBasePropertiesOneType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
}

impl UnionWithBasePropertiesOne {
    pub fn builder() -> UnionWithBasePropertiesOneBuilder {
        <UnionWithBasePropertiesOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithBasePropertiesOneBuilder {
    r#type: Option<UnionWithBasePropertiesOneType>,
    value: Option<String>,
}

impl UnionWithBasePropertiesOneBuilder {
    pub fn r#type(mut self, value: UnionWithBasePropertiesOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UnionWithBasePropertiesOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](UnionWithBasePropertiesOneBuilder::r#type)
    pub fn build(self) -> Result<UnionWithBasePropertiesOne, BuildError> {
        Ok(UnionWithBasePropertiesOne {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
