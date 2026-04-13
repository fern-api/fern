pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwentySeven {
    #[serde(flatten)]
    pub triangular_repair_fields: TriangularRepair,
    pub r#type: BigUnionTwentySevenType,
}

impl BigUnionTwentySeven {
    pub fn builder() -> BigUnionTwentySevenBuilder {
        <BigUnionTwentySevenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwentySevenBuilder {
    triangular_repair_fields: Option<TriangularRepair>,
    r#type: Option<BigUnionTwentySevenType>,
}

impl BigUnionTwentySevenBuilder {
    pub fn triangular_repair_fields(mut self, value: TriangularRepair) -> Self {
        self.triangular_repair_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwentySevenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwentySeven`].
    /// This method will fail if any of the following fields are not set:
    /// - [`triangular_repair_fields`](BigUnionTwentySevenBuilder::triangular_repair_fields)
    /// - [`r#type`](BigUnionTwentySevenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwentySeven, BuildError> {
        Ok(BigUnionTwentySeven {
            triangular_repair_fields: self
                .triangular_repair_fields
                .ok_or_else(|| BuildError::missing_field("triangular_repair_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
