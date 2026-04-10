pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionFive {
    #[serde(flatten)]
    pub distinct_failure_fields: DistinctFailure,
    pub r#type: BigUnionFiveType,
}

impl BigUnionFive {
    pub fn builder() -> BigUnionFiveBuilder {
        <BigUnionFiveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionFiveBuilder {
    distinct_failure_fields: Option<DistinctFailure>,
    r#type: Option<BigUnionFiveType>,
}

impl BigUnionFiveBuilder {
    pub fn distinct_failure_fields(mut self, value: DistinctFailure) -> Self {
        self.distinct_failure_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionFiveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionFive`].
    /// This method will fail if any of the following fields are not set:
    /// - [`distinct_failure_fields`](BigUnionFiveBuilder::distinct_failure_fields)
    /// - [`r#type`](BigUnionFiveBuilder::r#type)
    pub fn build(self) -> Result<BigUnionFive, BuildError> {
        Ok(BigUnionFive {
            distinct_failure_fields: self.distinct_failure_fields.ok_or_else(|| BuildError::missing_field("distinct_failure_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
