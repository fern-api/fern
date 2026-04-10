pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableValueFive {
    #[serde(flatten)]
    pub map_value_fields: MapValue,
    pub r#type: VariableValueFiveType,
}

impl VariableValueFive {
    pub fn builder() -> VariableValueFiveBuilder {
        <VariableValueFiveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueFiveBuilder {
    map_value_fields: Option<MapValue>,
    r#type: Option<VariableValueFiveType>,
}

impl VariableValueFiveBuilder {
    pub fn map_value_fields(mut self, value: MapValue) -> Self {
        self.map_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: VariableValueFiveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableValueFive`].
    /// This method will fail if any of the following fields are not set:
    /// - [`map_value_fields`](VariableValueFiveBuilder::map_value_fields)
    /// - [`r#type`](VariableValueFiveBuilder::r#type)
    pub fn build(self) -> Result<VariableValueFive, BuildError> {
        Ok(VariableValueFive {
            map_value_fields: self
                .map_value_fields
                .ok_or_else(|| BuildError::missing_field("map_value_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
