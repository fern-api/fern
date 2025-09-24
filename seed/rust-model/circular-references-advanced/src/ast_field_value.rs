use crate::ast_primitive_value::PrimitiveValue;
use crate::ast_object_value::ObjectValue;
use crate::ast_container_value::ContainerValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
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
