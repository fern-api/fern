pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ANestedLiteral {
    #[serde(rename = "myLiteral")]
    pub my_literal: ANestedLiteralMyLiteral,
}

impl ANestedLiteral {
    pub fn builder() -> ANestedLiteralBuilder {
        <ANestedLiteralBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ANestedLiteralBuilder {
    my_literal: Option<ANestedLiteralMyLiteral>,
}

impl ANestedLiteralBuilder {
    pub fn my_literal(mut self, value: ANestedLiteralMyLiteral) -> Self {
        self.my_literal = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ANestedLiteral`].
    /// This method will fail if any of the following fields are not set:
    /// - [`my_literal`](ANestedLiteralBuilder::my_literal)
    pub fn build(self) -> Result<ANestedLiteral, BuildError> {
        Ok(ANestedLiteral {
            my_literal: self.my_literal.ok_or_else(|| BuildError::missing_field("my_literal"))?,
        })
    }
}
