pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TestCaseImplementationDescription {
    #[serde(default)]
    pub boards: Vec<TestCaseImplementationDescriptionBoard>,
}

impl TestCaseImplementationDescription {
    pub fn builder() -> TestCaseImplementationDescriptionBuilder {
        TestCaseImplementationDescriptionBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseImplementationDescriptionBuilder {
    boards: Option<Vec<TestCaseImplementationDescriptionBoard>>,
}

impl TestCaseImplementationDescriptionBuilder {
    pub fn boards(mut self, value: Vec<TestCaseImplementationDescriptionBoard>) -> Self {
        self.boards = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseImplementationDescription`].
    /// This method will fail if any of the following fields are not set:
    /// - [`boards`](TestCaseImplementationDescriptionBuilder::boards)
    pub fn build(self) -> Result<TestCaseImplementationDescription, BuildError> {
        Ok(TestCaseImplementationDescription {
            boards: self.boards.ok_or_else(|| BuildError::missing_field("boards"))?,
        })
    }
}
