pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ShapeZero {
    #[serde(flatten)]
    pub circle_fields: Circle,
    pub r#type: ShapeZeroType,
}

impl ShapeZero {
    pub fn builder() -> ShapeZeroBuilder {
        <ShapeZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ShapeZeroBuilder {
    circle_fields: Option<Circle>,
    r#type: Option<ShapeZeroType>,
}

impl ShapeZeroBuilder {
    pub fn circle_fields(mut self, value: Circle) -> Self {
        self.circle_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: ShapeZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ShapeZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`circle_fields`](ShapeZeroBuilder::circle_fields)
    /// - [`r#type`](ShapeZeroBuilder::r#type)
    pub fn build(self) -> Result<ShapeZero, BuildError> {
        Ok(ShapeZero {
            circle_fields: self.circle_fields.ok_or_else(|| BuildError::missing_field("circle_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
