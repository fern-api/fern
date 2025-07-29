use crate::primitive_value::PrimitiveValue;
use crate::object_value::ObjectValue;
use crate::container_value::ContainerValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum FieldValue {
        #[serde(rename = "primitive_value")]
        PrimitiveValue {
            value: PrimitiveValue,
        },

        #[serde(rename = "object_value")]
        ObjectValue {
            #[serde(flatten)]
            data: ObjectValue,
        },

        #[serde(rename = "container_value")]
        ContainerValue {
            value: ContainerValue,
        },
}
