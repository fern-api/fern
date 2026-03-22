pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithBaseProperties {
        #[serde(rename = "integer")]
        #[non_exhaustive]
        Integer {
            value: i64,
            id: String,
        },

        #[serde(rename = "string")]
        #[non_exhaustive]
        r#String {
            value: String,
            id: String,
        },

        #[serde(rename = "foo")]
        #[non_exhaustive]
        Foo {
            #[serde(flatten)]
            data: Foo,
            id: String,
        },
}

impl UnionWithBaseProperties {
    pub fn integer(value: i64, id: String) -> Self {
        Self::Integer { value, id }
    }

    pub fn string(value: String, id: String) -> Self {
        Self::r#String { value, id }
    }

    pub fn foo(data: Foo, id: String) -> Self {
        Self::Foo { data, id }
    }

    pub fn get_id(&self) -> &str {
        match self {
                    Self::Integer { id, .. } => id,
                    Self::String { id, .. } => id,
                    Self::Foo { id, .. } => id,
                }
    }
}
