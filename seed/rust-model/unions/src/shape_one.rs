pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ShapeOne {
    #[serde(flatten)]
    pub square_fields: Square,
    pub r#type: ShapeOneType,
}

impl ShapeOne {
    pub fn builder() -> ShapeOneBuilder {
        <ShapeOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ShapeOneBuilder {
    square_fields: Option<Square>,
    r#type: Option<ShapeOneType>,
}

impl ShapeOneBuilder {
    pub fn square_fields(mut self, value: Square) -> Self {
        self.square_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: ShapeOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ShapeOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`square_fields`](ShapeOneBuilder::square_fields)
    /// - [`r#type`](ShapeOneBuilder::r#type)
    pub fn build(self) -> Result<ShapeOne, BuildError> {
        Ok(ShapeOne {
            square_fields: self.square_fields.ok_or_else(|| BuildError::missing_field("square_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
