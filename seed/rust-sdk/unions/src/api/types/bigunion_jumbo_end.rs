pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct JumboEnd {
    #[serde(default)]
    pub value: String,
}

impl JumboEnd {
    pub fn builder() -> JumboEndBuilder {
        JumboEndBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct JumboEndBuilder {
    value: Option<String>,
}

impl JumboEndBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`JumboEnd`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](JumboEndBuilder::value)
    pub fn build(self) -> Result<JumboEnd, BuildError> {
        Ok(JumboEnd {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
