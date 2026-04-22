pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DeployParams {
    #[serde(rename = "updateDraft")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub update_draft: Option<bool>,
}

impl DeployParams {
    pub fn builder() -> DeployParamsBuilder {
        <DeployParamsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DeployParamsBuilder {
    update_draft: Option<bool>,
}

impl DeployParamsBuilder {
    pub fn update_draft(mut self, value: bool) -> Self {
        self.update_draft = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DeployParams`].
    pub fn build(self) -> Result<DeployParams, BuildError> {
        Ok(DeployParams {
            update_draft: self.update_draft,
        })
    }
}
