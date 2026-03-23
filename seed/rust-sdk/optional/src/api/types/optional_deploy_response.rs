pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DeployResponse {
    #[serde(default)]
    pub success: bool,
}

impl DeployResponse {
    pub fn builder() -> DeployResponseBuilder {
        DeployResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DeployResponseBuilder {
    success: Option<bool>,
}

impl DeployResponseBuilder {
    pub fn success(mut self, value: bool) -> Self {
        self.success = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DeployResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`success`](DeployResponseBuilder::success)
    pub fn build(self) -> Result<DeployResponse, BuildError> {
        Ok(DeployResponse {
            success: self
                .success
                .ok_or_else(|| BuildError::missing_field("success"))?,
        })
    }
}
