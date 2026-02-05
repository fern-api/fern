pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithBaseProperties {
        #[serde(rename = "integer")]
        Integer {
            value: i64,
            id: String,
        },

        #[serde(rename = "string")]
        r#String {
            value: String,
            id: String,
        },

        #[serde(rename = "foo")]
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
