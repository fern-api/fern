pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2TestCaseExpects {
    #[serde(rename = "expectedStdout")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_stdout: Option<String>,
}

impl V2TestCaseExpects {
    pub fn builder() -> V2TestCaseExpectsBuilder {
        <V2TestCaseExpectsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseExpectsBuilder {
    expected_stdout: Option<String>,
}

impl V2TestCaseExpectsBuilder {
    pub fn expected_stdout(mut self, value: impl Into<String>) -> Self {
        self.expected_stdout = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`V2TestCaseExpects`].
    pub fn build(self) -> Result<V2TestCaseExpects, BuildError> {
        Ok(V2TestCaseExpects {
            expected_stdout: self.expected_stdout,
        })
    }
}
