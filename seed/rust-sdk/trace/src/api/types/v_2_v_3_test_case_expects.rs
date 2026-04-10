pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2V3TestCaseExpects {
    #[serde(rename = "expectedStdout")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_stdout: Option<String>,
}

impl V2V3TestCaseExpects {
    pub fn builder() -> V2V3TestCaseExpectsBuilder {
        <V2V3TestCaseExpectsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseExpectsBuilder {
    expected_stdout: Option<String>,
}

impl V2V3TestCaseExpectsBuilder {
    pub fn expected_stdout(mut self, value: impl Into<String>) -> Self {
        self.expected_stdout = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseExpects`].
    pub fn build(self) -> Result<V2V3TestCaseExpects, BuildError> {
        Ok(V2V3TestCaseExpects {
            expected_stdout: self.expected_stdout,
        })
    }
}
