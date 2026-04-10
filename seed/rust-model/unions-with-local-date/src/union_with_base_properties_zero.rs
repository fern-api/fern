pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithBasePropertiesZero {
    pub r#type: UnionWithBasePropertiesZeroType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<i64>,
}

impl UnionWithBasePropertiesZero {
    pub fn builder() -> UnionWithBasePropertiesZeroBuilder {
        <UnionWithBasePropertiesZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithBasePropertiesZeroBuilder {
    r#type: Option<UnionWithBasePropertiesZeroType>,
    value: Option<i64>,
}

impl UnionWithBasePropertiesZeroBuilder {
    pub fn r#type(mut self, value: UnionWithBasePropertiesZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: i64) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithBasePropertiesZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](UnionWithBasePropertiesZeroBuilder::r#type)
    pub fn build(self) -> Result<UnionWithBasePropertiesZero, BuildError> {
        Ok(UnionWithBasePropertiesZero {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
