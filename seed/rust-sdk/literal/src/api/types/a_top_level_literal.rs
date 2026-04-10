pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ATopLevelLiteral {
    #[serde(rename = "nestedLiteral")]
    pub nested_literal: ANestedLiteral,
}

impl ATopLevelLiteral {
    pub fn builder() -> ATopLevelLiteralBuilder {
        <ATopLevelLiteralBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ATopLevelLiteralBuilder {
    nested_literal: Option<ANestedLiteral>,
}

impl ATopLevelLiteralBuilder {
    pub fn nested_literal(mut self, value: ANestedLiteral) -> Self {
        self.nested_literal = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ATopLevelLiteral`].
    /// This method will fail if any of the following fields are not set:
    /// - [`nested_literal`](ATopLevelLiteralBuilder::nested_literal)
    pub fn build(self) -> Result<ATopLevelLiteral, BuildError> {
        Ok(ATopLevelLiteral {
            nested_literal: self
                .nested_literal
                .ok_or_else(|| BuildError::missing_field("nested_literal"))?,
        })
    }
}
