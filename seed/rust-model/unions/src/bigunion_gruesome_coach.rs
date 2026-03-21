pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GruesomeCoach {
    #[serde(default)]
    pub value: String,
}

impl GruesomeCoach {
    pub fn builder() -> GruesomeCoachBuilder {
        GruesomeCoachBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GruesomeCoachBuilder {
    value: Option<String>,
}

impl GruesomeCoachBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GruesomeCoach`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](GruesomeCoachBuilder::value)
    pub fn build(self) -> Result<GruesomeCoach, BuildError> {
        Ok(GruesomeCoach {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
