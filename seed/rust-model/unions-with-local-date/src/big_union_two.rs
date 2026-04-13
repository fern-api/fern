pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwo {
    #[serde(flatten)]
    pub jumbo_end_fields: JumboEnd,
    pub r#type: BigUnionTwoType,
}

impl BigUnionTwo {
    pub fn builder() -> BigUnionTwoBuilder {
        <BigUnionTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwoBuilder {
    jumbo_end_fields: Option<JumboEnd>,
    r#type: Option<BigUnionTwoType>,
}

impl BigUnionTwoBuilder {
    pub fn jumbo_end_fields(mut self, value: JumboEnd) -> Self {
        self.jumbo_end_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`jumbo_end_fields`](BigUnionTwoBuilder::jumbo_end_fields)
    /// - [`r#type`](BigUnionTwoBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwo, BuildError> {
        Ok(BigUnionTwo {
            jumbo_end_fields: self.jumbo_end_fields.ok_or_else(|| BuildError::missing_field("jumbo_end_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
