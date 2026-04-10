pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2TestCaseImplementationDescription {
    #[serde(default)]
    pub boards: Vec<V2TestCaseImplementationDescriptionBoard>,
}

impl V2TestCaseImplementationDescription {
    pub fn builder() -> V2TestCaseImplementationDescriptionBuilder {
        <V2TestCaseImplementationDescriptionBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseImplementationDescriptionBuilder {
    boards: Option<Vec<V2TestCaseImplementationDescriptionBoard>>,
}

impl V2TestCaseImplementationDescriptionBuilder {
    pub fn boards(mut self, value: Vec<V2TestCaseImplementationDescriptionBoard>) -> Self {
        self.boards = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2TestCaseImplementationDescription`].
    /// This method will fail if any of the following fields are not set:
    /// - [`boards`](V2TestCaseImplementationDescriptionBuilder::boards)
    pub fn build(self) -> Result<V2TestCaseImplementationDescription, BuildError> {
        Ok(V2TestCaseImplementationDescription {
            boards: self
                .boards
                .ok_or_else(|| BuildError::missing_field("boards"))?,
        })
    }
}
