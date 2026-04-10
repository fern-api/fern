pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionNine {
    #[serde(flatten)]
    pub active_diamond_fields: ActiveDiamond,
    pub r#type: BigUnionNineType,
}

impl BigUnionNine {
    pub fn builder() -> BigUnionNineBuilder {
        <BigUnionNineBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionNineBuilder {
    active_diamond_fields: Option<ActiveDiamond>,
    r#type: Option<BigUnionNineType>,
}

impl BigUnionNineBuilder {
    pub fn active_diamond_fields(mut self, value: ActiveDiamond) -> Self {
        self.active_diamond_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionNineType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionNine`].
    /// This method will fail if any of the following fields are not set:
    /// - [`active_diamond_fields`](BigUnionNineBuilder::active_diamond_fields)
    /// - [`r#type`](BigUnionNineBuilder::r#type)
    pub fn build(self) -> Result<BigUnionNine, BuildError> {
        Ok(BigUnionNine {
            active_diamond_fields: self.active_diamond_fields.ok_or_else(|| BuildError::missing_field("active_diamond_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
