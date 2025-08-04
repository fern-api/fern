use crate::foo::Foo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithBaseProperties {
        Integer {
            value: i32,
            id: String,
        },

        String {
            value: String,
            id: String,
        },

        Foo {
            #[serde(flatten)]
            data: Foo,
            id: String,
        },
}

impl UnionWithBaseProperties {
    pub fn get_id(&self) -> &String {
        match self {
                    Self::Integer { id, .. } => id,
                    Self::String { id, .. } => id,
                    Self::Foo { id, .. } => id,
                }
    }

}
