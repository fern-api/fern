pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionSignatureThatTakesActualResult2 {
    #[serde(default)]
    pub parameters: Vec<Parameter2>,
    #[serde(rename = "actualResultType")]
    pub actual_result_type: VariableType,
}

impl VoidFunctionSignatureThatTakesActualResult2 {
    pub fn builder() -> VoidFunctionSignatureThatTakesActualResult2Builder {
        VoidFunctionSignatureThatTakesActualResult2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VoidFunctionSignatureThatTakesActualResult2Builder {
    parameters: Option<Vec<Parameter2>>,
    actual_result_type: Option<VariableType>,
}

impl VoidFunctionSignatureThatTakesActualResult2Builder {
    pub fn parameters(mut self, value: Vec<Parameter2>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn actual_result_type(mut self, value: VariableType) -> Self {
        self.actual_result_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VoidFunctionSignatureThatTakesActualResult2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](VoidFunctionSignatureThatTakesActualResult2Builder::parameters)
    /// - [`actual_result_type`](VoidFunctionSignatureThatTakesActualResult2Builder::actual_result_type)
    pub fn build(self) -> Result<VoidFunctionSignatureThatTakesActualResult2, BuildError> {
        Ok(VoidFunctionSignatureThatTakesActualResult2 {
            parameters: self
                .parameters
                .ok_or_else(|| BuildError::missing_field("parameters"))?,
            actual_result_type: self
                .actual_result_type
                .ok_or_else(|| BuildError::missing_field("actual_result_type"))?,
        })
    }
}
