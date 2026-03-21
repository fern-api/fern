pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ProblemDescription {
    #[serde(default)]
    pub boards: Vec<ProblemDescriptionBoard>,
}

impl ProblemDescription {
    pub fn builder() -> ProblemDescriptionBuilder {
        ProblemDescriptionBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProblemDescriptionBuilder {
    boards: Option<Vec<ProblemDescriptionBoard>>,
}

impl ProblemDescriptionBuilder {
    pub fn boards(mut self, value: Vec<ProblemDescriptionBoard>) -> Self {
        self.boards = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ProblemDescription`].
    /// This method will fail if any of the following fields are not set:
    /// - [`boards`](ProblemDescriptionBuilder::boards)
    pub fn build(self) -> Result<ProblemDescription, BuildError> {
        Ok(ProblemDescription {
            boards: self.boards.ok_or_else(|| BuildError::missing_field("boards"))?,
        })
    }
}
