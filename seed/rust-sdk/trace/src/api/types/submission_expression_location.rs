pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ExpressionLocation {
    #[serde(default)]
    pub start: i64,
    #[serde(default)]
    pub offset: i64,
}

impl ExpressionLocation {
    pub fn builder() -> ExpressionLocationBuilder {
        ExpressionLocationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExpressionLocationBuilder {
    start: Option<i64>,
    offset: Option<i64>,
}

impl ExpressionLocationBuilder {
    pub fn start(mut self, value: i64) -> Self {
        self.start = Some(value);
        self
    }

    pub fn offset(mut self, value: i64) -> Self {
        self.offset = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ExpressionLocation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`start`](ExpressionLocationBuilder::start)
    /// - [`offset`](ExpressionLocationBuilder::offset)
    pub fn build(self) -> Result<ExpressionLocation, BuildError> {
        Ok(ExpressionLocation {
            start: self
                .start
                .ok_or_else(|| BuildError::missing_field("start"))?,
            offset: self
                .offset
                .ok_or_else(|| BuildError::missing_field("offset"))?,
        })
    }
}
