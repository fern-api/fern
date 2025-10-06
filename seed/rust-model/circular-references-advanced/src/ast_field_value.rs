pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum AstFieldValue {
        #[serde(rename = "primitive_value")]
        PrimitiveValue {
            value: AstPrimitiveValue,
        },

        #[serde(rename = "object_value")]
        ObjectValue {
            #[serde(flatten)]
            data: AstObjectValue,
        },

        #[serde(rename = "container_value")]
        ContainerValue {
            value: AstContainerValue,
        },
}
