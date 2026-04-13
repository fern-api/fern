pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Ec2BootInstanceRequest {
    #[serde(default)]
    pub size: String,
}

impl Ec2BootInstanceRequest {
    pub fn builder() -> Ec2BootInstanceRequestBuilder {
        <Ec2BootInstanceRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Ec2BootInstanceRequestBuilder {
    size: Option<String>,
}

impl Ec2BootInstanceRequestBuilder {
    pub fn size(mut self, value: impl Into<String>) -> Self {
        self.size = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Ec2BootInstanceRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`size`](Ec2BootInstanceRequestBuilder::size)
    pub fn build(self) -> Result<Ec2BootInstanceRequest, BuildError> {
        Ok(Ec2BootInstanceRequest {
            size: self.size.ok_or_else(|| BuildError::missing_field("size"))?,
        })
    }
}

