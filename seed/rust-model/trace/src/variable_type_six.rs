pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableTypeSix {
    #[serde(flatten)]
    pub map_type_fields: MapType,
    pub r#type: VariableTypeSixType,
}

impl VariableTypeSix {
    pub fn builder() -> VariableTypeSixBuilder {
        <VariableTypeSixBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeSixBuilder {
    map_type_fields: Option<MapType>,
    r#type: Option<VariableTypeSixType>,
}

impl VariableTypeSixBuilder {
    pub fn map_type_fields(mut self, value: MapType) -> Self {
        self.map_type_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: VariableTypeSixType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeSix`].
    /// This method will fail if any of the following fields are not set:
    /// - [`map_type_fields`](VariableTypeSixBuilder::map_type_fields)
    /// - [`r#type`](VariableTypeSixBuilder::r#type)
    pub fn build(self) -> Result<VariableTypeSix, BuildError> {
        Ok(VariableTypeSix {
            map_type_fields: self.map_type_fields.ok_or_else(|| BuildError::missing_field("map_type_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
