pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwentySix {
    #[serde(flatten)]
    pub potable_bad_fields: PotableBad,
    pub r#type: BigUnionTwentySixType,
}

impl BigUnionTwentySix {
    pub fn builder() -> BigUnionTwentySixBuilder {
        <BigUnionTwentySixBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwentySixBuilder {
    potable_bad_fields: Option<PotableBad>,
    r#type: Option<BigUnionTwentySixType>,
}

impl BigUnionTwentySixBuilder {
    pub fn potable_bad_fields(mut self, value: PotableBad) -> Self {
        self.potable_bad_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwentySixType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwentySix`].
    /// This method will fail if any of the following fields are not set:
    /// - [`potable_bad_fields`](BigUnionTwentySixBuilder::potable_bad_fields)
    /// - [`r#type`](BigUnionTwentySixBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwentySix, BuildError> {
        Ok(BigUnionTwentySix {
            potable_bad_fields: self.potable_bad_fields.ok_or_else(|| BuildError::missing_field("potable_bad_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
