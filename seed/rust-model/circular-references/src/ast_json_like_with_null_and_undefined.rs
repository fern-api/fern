pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum JsonLikeWithNullAndUndefined {
        List0(Vec<Option<Option<JsonLikeWithNullAndUndefined>>>),

        Map1(HashMap<String, Option<Option<JsonLikeWithNullAndUndefined>>>),

        Optional2(Option<Option<String>>),

        Optional3(Option<Option<i64>>),

        Optional4(Option<Option<bool>>),
}

impl JsonLikeWithNullAndUndefined {
    pub fn is_list0(&self) -> bool {
        matches!(self, Self::List0(_))
    }

    pub fn is_map1(&self) -> bool {
        matches!(self, Self::Map1(_))
    }

    pub fn is_optional2(&self) -> bool {
        matches!(self, Self::Optional2(_))
    }

    pub fn is_optional3(&self) -> bool {
        matches!(self, Self::Optional3(_))
    }

    pub fn is_optional4(&self) -> bool {
        matches!(self, Self::Optional4(_))
    }


    pub fn as_list0(&self) -> Option<&Vec<Option<Option<JsonLikeWithNullAndUndefined>>>> {
        match self {
                    Self::List0(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list0(self) -> Option<Vec<Option<Option<JsonLikeWithNullAndUndefined>>>> {
        match self {
                    Self::List0(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_map1(&self) -> Option<&HashMap<String, Option<Option<JsonLikeWithNullAndUndefined>>>> {
        match self {
                    Self::Map1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_map1(self) -> Option<HashMap<String, Option<Option<JsonLikeWithNullAndUndefined>>>> {
        match self {
                    Self::Map1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_optional2(&self) -> Option<&Option<Option<String>>> {
        match self {
                    Self::Optional2(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_optional2(self) -> Option<Option<Option<String>>> {
        match self {
                    Self::Optional2(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_optional3(&self) -> Option<&Option<Option<i64>>> {
        match self {
                    Self::Optional3(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_optional3(self) -> Option<Option<Option<i64>>> {
        match self {
                    Self::Optional3(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_optional4(&self) -> Option<&Option<Option<bool>>> {
        match self {
                    Self::Optional4(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_optional4(self) -> Option<Option<Option<bool>>> {
        match self {
                    Self::Optional4(value) => Some(value),
                    _ => None,
                }
    }

}
