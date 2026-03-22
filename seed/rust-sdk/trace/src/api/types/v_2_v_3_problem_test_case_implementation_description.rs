pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TestCaseImplementationDescription2 {
    #[serde(default)]
    pub boards: Vec<TestCaseImplementationDescriptionBoard2>,
}

impl TestCaseImplementationDescription2 {
    pub fn builder() -> TestCaseImplementationDescription2Builder {
        TestCaseImplementationDescription2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseImplementationDescription2Builder {
    boards: Option<Vec<TestCaseImplementationDescriptionBoard2>>,
}

impl TestCaseImplementationDescription2Builder {
    pub fn boards(mut self, value: Vec<TestCaseImplementationDescriptionBoard2>) -> Self {
        self.boards = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseImplementationDescription2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`boards`](TestCaseImplementationDescription2Builder::boards)
    pub fn build(self) -> Result<TestCaseImplementationDescription2, BuildError> {
        Ok(TestCaseImplementationDescription2 {
            boards: self
                .boards
                .ok_or_else(|| BuildError::missing_field("boards"))?,
        })
    }
}
