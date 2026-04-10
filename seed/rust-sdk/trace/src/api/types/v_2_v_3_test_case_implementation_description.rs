pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2V3TestCaseImplementationDescription {
    #[serde(default)]
    pub boards: Vec<V2V3TestCaseImplementationDescriptionBoard>,
}

impl V2V3TestCaseImplementationDescription {
    pub fn builder() -> V2V3TestCaseImplementationDescriptionBuilder {
        <V2V3TestCaseImplementationDescriptionBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseImplementationDescriptionBuilder {
    boards: Option<Vec<V2V3TestCaseImplementationDescriptionBoard>>,
}

impl V2V3TestCaseImplementationDescriptionBuilder {
    pub fn boards(mut self, value: Vec<V2V3TestCaseImplementationDescriptionBoard>) -> Self {
        self.boards = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseImplementationDescription`].
    /// This method will fail if any of the following fields are not set:
    /// - [`boards`](V2V3TestCaseImplementationDescriptionBuilder::boards)
    pub fn build(self) -> Result<V2V3TestCaseImplementationDescription, BuildError> {
        Ok(V2V3TestCaseImplementationDescription {
            boards: self
                .boards
                .ok_or_else(|| BuildError::missing_field("boards"))?,
        })
    }
}
