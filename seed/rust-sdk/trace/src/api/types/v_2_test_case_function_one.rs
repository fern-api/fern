pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2TestCaseFunctionOne {
    #[serde(flatten)]
    pub v2void_function_definition_fields: V2VoidFunctionDefinition,
    pub r#type: V2TestCaseFunctionOneType,
}

impl V2TestCaseFunctionOne {
    pub fn builder() -> V2TestCaseFunctionOneBuilder {
        <V2TestCaseFunctionOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseFunctionOneBuilder {
    v2void_function_definition_fields: Option<V2VoidFunctionDefinition>,
    r#type: Option<V2TestCaseFunctionOneType>,
}

impl V2TestCaseFunctionOneBuilder {
    pub fn v2void_function_definition_fields(mut self, value: V2VoidFunctionDefinition) -> Self {
        self.v2void_function_definition_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2TestCaseFunctionOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2TestCaseFunctionOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2void_function_definition_fields`](V2TestCaseFunctionOneBuilder::v2void_function_definition_fields)
    /// - [`r#type`](V2TestCaseFunctionOneBuilder::r#type)
    pub fn build(self) -> Result<V2TestCaseFunctionOne, BuildError> {
        Ok(V2TestCaseFunctionOne {
            v2void_function_definition_fields: self
                .v2void_function_definition_fields
                .ok_or_else(|| BuildError::missing_field("v2void_function_definition_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
