pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CronJob {
    #[serde(default)]
    pub expression: String,
}

impl CronJob {
    pub fn builder() -> CronJobBuilder {
        CronJobBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CronJobBuilder {
    expression: Option<String>,
}

impl CronJobBuilder {
    pub fn expression(mut self, value: impl Into<String>) -> Self {
        self.expression = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CronJob`].
    /// This method will fail if any of the following fields are not set:
    /// - [`expression`](CronJobBuilder::expression)
    pub fn build(self) -> Result<CronJob, BuildError> {
        Ok(CronJob {
            expression: self
                .expression
                .ok_or_else(|| BuildError::missing_field("expression"))?,
        })
    }
}
