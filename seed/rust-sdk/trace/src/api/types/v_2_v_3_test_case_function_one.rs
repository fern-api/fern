pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3TestCaseFunctionOne {
    #[serde(flatten)]
    pub v2v3void_function_definition_fields: V2V3VoidFunctionDefinition,
    pub r#type: V2V3TestCaseFunctionOneType,
}

impl V2V3TestCaseFunctionOne {
    pub fn builder() -> V2V3TestCaseFunctionOneBuilder {
        <V2V3TestCaseFunctionOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseFunctionOneBuilder {
    v2v3void_function_definition_fields: Option<V2V3VoidFunctionDefinition>,
    r#type: Option<V2V3TestCaseFunctionOneType>,
}

impl V2V3TestCaseFunctionOneBuilder {
    pub fn v2v3void_function_definition_fields(
        mut self,
        value: V2V3VoidFunctionDefinition,
    ) -> Self {
        self.v2v3void_function_definition_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2V3TestCaseFunctionOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseFunctionOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2v3void_function_definition_fields`](V2V3TestCaseFunctionOneBuilder::v2v3void_function_definition_fields)
    /// - [`r#type`](V2V3TestCaseFunctionOneBuilder::r#type)
    pub fn build(self) -> Result<V2V3TestCaseFunctionOne, BuildError> {
        Ok(V2V3TestCaseFunctionOne {
            v2v3void_function_definition_fields: self
                .v2v3void_function_definition_fields
                .ok_or_else(|| BuildError::missing_field("v2v3void_function_definition_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
