pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwentyThree {
    #[serde(flatten)]
    pub attractive_script_fields: AttractiveScript,
    pub r#type: BigUnionTwentyThreeType,
}

impl BigUnionTwentyThree {
    pub fn builder() -> BigUnionTwentyThreeBuilder {
        <BigUnionTwentyThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwentyThreeBuilder {
    attractive_script_fields: Option<AttractiveScript>,
    r#type: Option<BigUnionTwentyThreeType>,
}

impl BigUnionTwentyThreeBuilder {
    pub fn attractive_script_fields(mut self, value: AttractiveScript) -> Self {
        self.attractive_script_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwentyThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwentyThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`attractive_script_fields`](BigUnionTwentyThreeBuilder::attractive_script_fields)
    /// - [`r#type`](BigUnionTwentyThreeBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwentyThree, BuildError> {
        Ok(BigUnionTwentyThree {
            attractive_script_fields: self
                .attractive_script_fields
                .ok_or_else(|| BuildError::missing_field("attractive_script_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
