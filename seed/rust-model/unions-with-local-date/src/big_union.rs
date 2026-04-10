pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum BigUnion {
        BigUnionZero(BigUnionZero),

        BigUnionOne(BigUnionOne),

        BigUnionTwo(BigUnionTwo),

        BigUnionThree(BigUnionThree),

        BigUnionFour(BigUnionFour),

        BigUnionFive(BigUnionFive),

        BigUnionSix(BigUnionSix),

        BigUnionSeven(BigUnionSeven),

        BigUnionEight(BigUnionEight),

        BigUnionNine(BigUnionNine),

        BigUnionTen(BigUnionTen),

        BigUnionEleven(BigUnionEleven),

        BigUnionTwelve(BigUnionTwelve),

        BigUnionThirteen(BigUnionThirteen),

        BigUnionFourteen(BigUnionFourteen),

        BigUnionFifteen(BigUnionFifteen),

        BigUnionSixteen(BigUnionSixteen),

        BigUnionSeventeen(BigUnionSeventeen),

        BigUnionEighteen(BigUnionEighteen),

        BigUnionNineteen(BigUnionNineteen),

        BigUnionTwenty(BigUnionTwenty),

        BigUnionTwentyOne(BigUnionTwentyOne),

        BigUnionTwentyTwo(BigUnionTwentyTwo),

        BigUnionTwentyThree(BigUnionTwentyThree),

        BigUnionTwentyFour(BigUnionTwentyFour),

        BigUnionTwentyFive(BigUnionTwentyFive),

        BigUnionTwentySix(BigUnionTwentySix),

        BigUnionTwentySeven(BigUnionTwentySeven),

        BigUnionTwentyEight(BigUnionTwentyEight),
}

impl BigUnion {
    pub fn is_big_union_zero(&self) -> bool {
        matches!(self, Self::BigUnionZero(_))
    }

    pub fn is_big_union_one(&self) -> bool {
        matches!(self, Self::BigUnionOne(_))
    }

    pub fn is_big_union_two(&self) -> bool {
        matches!(self, Self::BigUnionTwo(_))
    }

    pub fn is_big_union_three(&self) -> bool {
        matches!(self, Self::BigUnionThree(_))
    }

    pub fn is_big_union_four(&self) -> bool {
        matches!(self, Self::BigUnionFour(_))
    }

    pub fn is_big_union_five(&self) -> bool {
        matches!(self, Self::BigUnionFive(_))
    }

    pub fn is_big_union_six(&self) -> bool {
        matches!(self, Self::BigUnionSix(_))
    }

    pub fn is_big_union_seven(&self) -> bool {
        matches!(self, Self::BigUnionSeven(_))
    }

    pub fn is_big_union_eight(&self) -> bool {
        matches!(self, Self::BigUnionEight(_))
    }

    pub fn is_big_union_nine(&self) -> bool {
        matches!(self, Self::BigUnionNine(_))
    }

    pub fn is_big_union_ten(&self) -> bool {
        matches!(self, Self::BigUnionTen(_))
    }

    pub fn is_big_union_eleven(&self) -> bool {
        matches!(self, Self::BigUnionEleven(_))
    }

    pub fn is_big_union_twelve(&self) -> bool {
        matches!(self, Self::BigUnionTwelve(_))
    }

    pub fn is_big_union_thirteen(&self) -> bool {
        matches!(self, Self::BigUnionThirteen(_))
    }

    pub fn is_big_union_fourteen(&self) -> bool {
        matches!(self, Self::BigUnionFourteen(_))
    }

    pub fn is_big_union_fifteen(&self) -> bool {
        matches!(self, Self::BigUnionFifteen(_))
    }

    pub fn is_big_union_sixteen(&self) -> bool {
        matches!(self, Self::BigUnionSixteen(_))
    }

    pub fn is_big_union_seventeen(&self) -> bool {
        matches!(self, Self::BigUnionSeventeen(_))
    }

    pub fn is_big_union_eighteen(&self) -> bool {
        matches!(self, Self::BigUnionEighteen(_))
    }

    pub fn is_big_union_nineteen(&self) -> bool {
        matches!(self, Self::BigUnionNineteen(_))
    }

    pub fn is_big_union_twenty(&self) -> bool {
        matches!(self, Self::BigUnionTwenty(_))
    }

    pub fn is_big_union_twenty_one(&self) -> bool {
        matches!(self, Self::BigUnionTwentyOne(_))
    }

    pub fn is_big_union_twenty_two(&self) -> bool {
        matches!(self, Self::BigUnionTwentyTwo(_))
    }

    pub fn is_big_union_twenty_three(&self) -> bool {
        matches!(self, Self::BigUnionTwentyThree(_))
    }

    pub fn is_big_union_twenty_four(&self) -> bool {
        matches!(self, Self::BigUnionTwentyFour(_))
    }

    pub fn is_big_union_twenty_five(&self) -> bool {
        matches!(self, Self::BigUnionTwentyFive(_))
    }

    pub fn is_big_union_twenty_six(&self) -> bool {
        matches!(self, Self::BigUnionTwentySix(_))
    }

    pub fn is_big_union_twenty_seven(&self) -> bool {
        matches!(self, Self::BigUnionTwentySeven(_))
    }

    pub fn is_big_union_twenty_eight(&self) -> bool {
        matches!(self, Self::BigUnionTwentyEight(_))
    }


    pub fn as_big_union_zero(&self) -> Option<&BigUnionZero> {
        match self {
                    Self::BigUnionZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_zero(self) -> Option<BigUnionZero> {
        match self {
                    Self::BigUnionZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_one(&self) -> Option<&BigUnionOne> {
        match self {
                    Self::BigUnionOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_one(self) -> Option<BigUnionOne> {
        match self {
                    Self::BigUnionOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_two(&self) -> Option<&BigUnionTwo> {
        match self {
                    Self::BigUnionTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_two(self) -> Option<BigUnionTwo> {
        match self {
                    Self::BigUnionTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_three(&self) -> Option<&BigUnionThree> {
        match self {
                    Self::BigUnionThree(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_three(self) -> Option<BigUnionThree> {
        match self {
                    Self::BigUnionThree(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_four(&self) -> Option<&BigUnionFour> {
        match self {
                    Self::BigUnionFour(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_four(self) -> Option<BigUnionFour> {
        match self {
                    Self::BigUnionFour(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_five(&self) -> Option<&BigUnionFive> {
        match self {
                    Self::BigUnionFive(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_five(self) -> Option<BigUnionFive> {
        match self {
                    Self::BigUnionFive(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_six(&self) -> Option<&BigUnionSix> {
        match self {
                    Self::BigUnionSix(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_six(self) -> Option<BigUnionSix> {
        match self {
                    Self::BigUnionSix(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_seven(&self) -> Option<&BigUnionSeven> {
        match self {
                    Self::BigUnionSeven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_seven(self) -> Option<BigUnionSeven> {
        match self {
                    Self::BigUnionSeven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_eight(&self) -> Option<&BigUnionEight> {
        match self {
                    Self::BigUnionEight(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_eight(self) -> Option<BigUnionEight> {
        match self {
                    Self::BigUnionEight(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_nine(&self) -> Option<&BigUnionNine> {
        match self {
                    Self::BigUnionNine(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_nine(self) -> Option<BigUnionNine> {
        match self {
                    Self::BigUnionNine(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_ten(&self) -> Option<&BigUnionTen> {
        match self {
                    Self::BigUnionTen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_ten(self) -> Option<BigUnionTen> {
        match self {
                    Self::BigUnionTen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_eleven(&self) -> Option<&BigUnionEleven> {
        match self {
                    Self::BigUnionEleven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_eleven(self) -> Option<BigUnionEleven> {
        match self {
                    Self::BigUnionEleven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twelve(&self) -> Option<&BigUnionTwelve> {
        match self {
                    Self::BigUnionTwelve(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twelve(self) -> Option<BigUnionTwelve> {
        match self {
                    Self::BigUnionTwelve(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_thirteen(&self) -> Option<&BigUnionThirteen> {
        match self {
                    Self::BigUnionThirteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_thirteen(self) -> Option<BigUnionThirteen> {
        match self {
                    Self::BigUnionThirteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_fourteen(&self) -> Option<&BigUnionFourteen> {
        match self {
                    Self::BigUnionFourteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_fourteen(self) -> Option<BigUnionFourteen> {
        match self {
                    Self::BigUnionFourteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_fifteen(&self) -> Option<&BigUnionFifteen> {
        match self {
                    Self::BigUnionFifteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_fifteen(self) -> Option<BigUnionFifteen> {
        match self {
                    Self::BigUnionFifteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_sixteen(&self) -> Option<&BigUnionSixteen> {
        match self {
                    Self::BigUnionSixteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_sixteen(self) -> Option<BigUnionSixteen> {
        match self {
                    Self::BigUnionSixteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_seventeen(&self) -> Option<&BigUnionSeventeen> {
        match self {
                    Self::BigUnionSeventeen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_seventeen(self) -> Option<BigUnionSeventeen> {
        match self {
                    Self::BigUnionSeventeen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_eighteen(&self) -> Option<&BigUnionEighteen> {
        match self {
                    Self::BigUnionEighteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_eighteen(self) -> Option<BigUnionEighteen> {
        match self {
                    Self::BigUnionEighteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_nineteen(&self) -> Option<&BigUnionNineteen> {
        match self {
                    Self::BigUnionNineteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_nineteen(self) -> Option<BigUnionNineteen> {
        match self {
                    Self::BigUnionNineteen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twenty(&self) -> Option<&BigUnionTwenty> {
        match self {
                    Self::BigUnionTwenty(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twenty(self) -> Option<BigUnionTwenty> {
        match self {
                    Self::BigUnionTwenty(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twenty_one(&self) -> Option<&BigUnionTwentyOne> {
        match self {
                    Self::BigUnionTwentyOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twenty_one(self) -> Option<BigUnionTwentyOne> {
        match self {
                    Self::BigUnionTwentyOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twenty_two(&self) -> Option<&BigUnionTwentyTwo> {
        match self {
                    Self::BigUnionTwentyTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twenty_two(self) -> Option<BigUnionTwentyTwo> {
        match self {
                    Self::BigUnionTwentyTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twenty_three(&self) -> Option<&BigUnionTwentyThree> {
        match self {
                    Self::BigUnionTwentyThree(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twenty_three(self) -> Option<BigUnionTwentyThree> {
        match self {
                    Self::BigUnionTwentyThree(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twenty_four(&self) -> Option<&BigUnionTwentyFour> {
        match self {
                    Self::BigUnionTwentyFour(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twenty_four(self) -> Option<BigUnionTwentyFour> {
        match self {
                    Self::BigUnionTwentyFour(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twenty_five(&self) -> Option<&BigUnionTwentyFive> {
        match self {
                    Self::BigUnionTwentyFive(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twenty_five(self) -> Option<BigUnionTwentyFive> {
        match self {
                    Self::BigUnionTwentyFive(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twenty_six(&self) -> Option<&BigUnionTwentySix> {
        match self {
                    Self::BigUnionTwentySix(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twenty_six(self) -> Option<BigUnionTwentySix> {
        match self {
                    Self::BigUnionTwentySix(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twenty_seven(&self) -> Option<&BigUnionTwentySeven> {
        match self {
                    Self::BigUnionTwentySeven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twenty_seven(self) -> Option<BigUnionTwentySeven> {
        match self {
                    Self::BigUnionTwentySeven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_big_union_twenty_eight(&self) -> Option<&BigUnionTwentyEight> {
        match self {
                    Self::BigUnionTwentyEight(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_big_union_twenty_eight(self) -> Option<BigUnionTwentyEight> {
        match self {
                    Self::BigUnionTwentyEight(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for BigUnion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::BigUnionZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionThree(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionFour(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionFive(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionSix(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionSeven(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionEight(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionNine(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTen(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionEleven(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwelve(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionThirteen(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionFourteen(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionFifteen(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionSixteen(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionSeventeen(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionEighteen(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionNineteen(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwenty(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwentyOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwentyTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwentyThree(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwentyFour(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwentyFive(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwentySix(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwentySeven(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::BigUnionTwentyEight(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
