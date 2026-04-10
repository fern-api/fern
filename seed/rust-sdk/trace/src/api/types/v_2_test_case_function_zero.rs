pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2TestCaseFunctionZero {
    #[serde(flatten)]
    pub v2test_case_with_actual_result_implementation_fields:
        V2TestCaseWithActualResultImplementation,
    pub r#type: V2TestCaseFunctionZeroType,
}

impl V2TestCaseFunctionZero {
    pub fn builder() -> V2TestCaseFunctionZeroBuilder {
        <V2TestCaseFunctionZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseFunctionZeroBuilder {
    v2test_case_with_actual_result_implementation_fields:
        Option<V2TestCaseWithActualResultImplementation>,
    r#type: Option<V2TestCaseFunctionZeroType>,
}

impl V2TestCaseFunctionZeroBuilder {
    pub fn v2test_case_with_actual_result_implementation_fields(
        mut self,
        value: V2TestCaseWithActualResultImplementation,
    ) -> Self {
        self.v2test_case_with_actual_result_implementation_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2TestCaseFunctionZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2TestCaseFunctionZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2test_case_with_actual_result_implementation_fields`](V2TestCaseFunctionZeroBuilder::v2test_case_with_actual_result_implementation_fields)
    /// - [`r#type`](V2TestCaseFunctionZeroBuilder::r#type)
    pub fn build(self) -> Result<V2TestCaseFunctionZero, BuildError> {
        Ok(V2TestCaseFunctionZero {
            v2test_case_with_actual_result_implementation_fields: self
                .v2test_case_with_actual_result_implementation_fields
                .ok_or_else(|| {
                    BuildError::missing_field(
                        "v2test_case_with_actual_result_implementation_fields",
                    )
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
