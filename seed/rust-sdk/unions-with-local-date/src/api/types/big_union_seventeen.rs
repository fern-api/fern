pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionSeventeen {
    #[serde(flatten)]
    pub total_work_fields: TotalWork,
    pub r#type: BigUnionSeventeenType,
}

impl BigUnionSeventeen {
    pub fn builder() -> BigUnionSeventeenBuilder {
        <BigUnionSeventeenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionSeventeenBuilder {
    total_work_fields: Option<TotalWork>,
    r#type: Option<BigUnionSeventeenType>,
}

impl BigUnionSeventeenBuilder {
    pub fn total_work_fields(mut self, value: TotalWork) -> Self {
        self.total_work_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionSeventeenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionSeventeen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`total_work_fields`](BigUnionSeventeenBuilder::total_work_fields)
    /// - [`r#type`](BigUnionSeventeenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionSeventeen, BuildError> {
        Ok(BigUnionSeventeen {
            total_work_fields: self
                .total_work_fields
                .ok_or_else(|| BuildError::missing_field("total_work_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
