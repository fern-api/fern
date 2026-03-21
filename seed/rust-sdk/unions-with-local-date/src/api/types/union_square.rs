pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Square {
    #[serde(default)]
    pub length: f64,
}

impl Square {
    pub fn builder() -> SquareBuilder {
        SquareBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SquareBuilder {
    length: Option<f64>,
}

impl SquareBuilder {
    pub fn length(mut self, value: f64) -> Self {
        self.length = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Square`].
    /// This method will fail if any of the following fields are not set:
    /// - [`length`](SquareBuilder::length)
    pub fn build(self) -> Result<Square, BuildError> {
        Ok(Square {
            length: self
                .length
                .ok_or_else(|| BuildError::missing_field("length"))?,
        })
    }
}
