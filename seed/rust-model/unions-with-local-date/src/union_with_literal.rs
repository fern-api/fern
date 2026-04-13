pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithLiteral {
    pub r#type: UnionWithLiteralType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<UnionWithLiteralValue>,
}

impl UnionWithLiteral {
    pub fn builder() -> UnionWithLiteralBuilder {
        <UnionWithLiteralBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithLiteralBuilder {
    r#type: Option<UnionWithLiteralType>,
    value: Option<UnionWithLiteralValue>,
}

impl UnionWithLiteralBuilder {
    pub fn r#type(mut self, value: UnionWithLiteralType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: UnionWithLiteralValue) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithLiteral`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](UnionWithLiteralBuilder::r#type)
    pub fn build(self) -> Result<UnionWithLiteral, BuildError> {
        Ok(UnionWithLiteral {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
