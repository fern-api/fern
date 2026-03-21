pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Acai {
    #[serde(flatten)]
    pub berry_fields: Berry,
}

impl Acai {
    pub fn builder() -> AcaiBuilder {
        AcaiBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AcaiBuilder {
    berry_fields: Option<Berry>,
}

impl AcaiBuilder {
    pub fn berry_fields(mut self, value: Berry) -> Self {
        self.berry_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Acai`].
    /// This method will fail if any of the following fields are not set:
    /// - [`berry_fields`](AcaiBuilder::berry_fields)
    pub fn build(self) -> Result<Acai, BuildError> {
        Ok(Acai {
            berry_fields: self.berry_fields.ok_or_else(|| BuildError::missing_field("berry_fields"))?,
        })
    }
}
