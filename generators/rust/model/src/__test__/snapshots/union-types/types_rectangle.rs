pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Rectangle {
    #[serde(default)]
    pub width: f64,
    #[serde(default)]
    pub height: f64,
}

impl Rectangle {
    pub fn builder() -> RectangleBuilder {
        RectangleBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RectangleBuilder {
    width: Option<f64>,
    height: Option<f64>,
}

impl RectangleBuilder {
    pub fn width(mut self, value: f64) -> Self {
        self.width = Some(value);
        self
    }

    pub fn height(mut self, value: f64) -> Self {
        self.height = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Rectangle`].
    /// This method will fail if any of the following fields are not set:
    /// - [`width`](RectangleBuilder::width)
    /// - [`height`](RectangleBuilder::height)
    pub fn build(self) -> Result<Rectangle, BuildError> {
        Ok(Rectangle {
            width: self.width.ok_or_else(|| BuildError::missing_field("width"))?,
            height: self.height.ok_or_else(|| BuildError::missing_field("height"))?,
        })
    }
}
