pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum BigUnion {
    #[serde(rename = "normalSweet")]
    #[non_exhaustive]
    NormalSweet {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "thankfulFactor")]
    #[non_exhaustive]
    ThankfulFactor {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "jumboEnd")]
    #[non_exhaustive]
    JumboEnd {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "hastyPain")]
    #[non_exhaustive]
    HastyPain {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "mistySnow")]
    #[non_exhaustive]
    MistySnow {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "distinctFailure")]
    #[non_exhaustive]
    DistinctFailure {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "practicalPrinciple")]
    #[non_exhaustive]
    PracticalPrinciple {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "limpingStep")]
    #[non_exhaustive]
    LimpingStep {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "vibrantExcitement")]
    #[non_exhaustive]
    VibrantExcitement {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "activeDiamond")]
    #[non_exhaustive]
    ActiveDiamond {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "popularLimit")]
    #[non_exhaustive]
    PopularLimit {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "falseMirror")]
    #[non_exhaustive]
    FalseMirror {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "primaryBlock")]
    #[non_exhaustive]
    PrimaryBlock {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "rotatingRatio")]
    #[non_exhaustive]
    RotatingRatio {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "colorfulCover")]
    #[non_exhaustive]
    ColorfulCover {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "disloyalValue")]
    #[non_exhaustive]
    DisloyalValue {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "gruesomeCoach")]
    #[non_exhaustive]
    GruesomeCoach {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "totalWork")]
    #[non_exhaustive]
    TotalWork {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "harmoniousPlay")]
    #[non_exhaustive]
    HarmoniousPlay {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "uniqueStress")]
    #[non_exhaustive]
    UniqueStress {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "unwillingSmoke")]
    #[non_exhaustive]
    UnwillingSmoke {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "frozenSleep")]
    #[non_exhaustive]
    FrozenSleep {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "diligentDeal")]
    #[non_exhaustive]
    DiligentDeal {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "attractiveScript")]
    #[non_exhaustive]
    AttractiveScript {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "hoarseMouse")]
    #[non_exhaustive]
    HoarseMouse {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "circularCard")]
    #[non_exhaustive]
    CircularCard {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "potableBad")]
    #[non_exhaustive]
    PotableBad {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "triangularRepair")]
    #[non_exhaustive]
    TriangularRepair {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "gaseousRoad")]
    #[non_exhaustive]
    GaseousRoad {
        #[serde(default)]
        value: String,
        id: String,
        #[serde(rename = "created-at")]
        #[serde(with = "crate::core::flexible_datetime::offset")]
        created_at: DateTime<FixedOffset>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        archived_at: Option<DateTime<FixedOffset>>,
    },
}

impl BigUnion {
    pub fn normal_sweet(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::NormalSweet {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn thankful_factor(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::ThankfulFactor {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn jumbo_end(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::JumboEnd {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn hasty_pain(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::HastyPain {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn misty_snow(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::MistySnow {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn distinct_failure(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::DistinctFailure {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn practical_principle(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::PracticalPrinciple {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn limping_step(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::LimpingStep {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn vibrant_excitement(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::VibrantExcitement {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn active_diamond(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::ActiveDiamond {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn popular_limit(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::PopularLimit {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn false_mirror(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::FalseMirror {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn primary_block(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::PrimaryBlock {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn rotating_ratio(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::RotatingRatio {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn colorful_cover(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::ColorfulCover {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn disloyal_value(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::DisloyalValue {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn gruesome_coach(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::GruesomeCoach {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn total_work(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::TotalWork {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn harmonious_play(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::HarmoniousPlay {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn unique_stress(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::UniqueStress {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn unwilling_smoke(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::UnwillingSmoke {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn frozen_sleep(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::FrozenSleep {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn diligent_deal(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::DiligentDeal {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn attractive_script(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::AttractiveScript {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn hoarse_mouse(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::HoarseMouse {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn circular_card(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::CircularCard {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn potable_bad(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::PotableBad {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn triangular_repair(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::TriangularRepair {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn gaseous_road(
        value: String,
        id: String,
        created_at: DateTime<FixedOffset>,
        archived_at: Option<DateTime<FixedOffset>>,
    ) -> Self {
        Self::GaseousRoad {
            value,
            id,
            created_at,
            archived_at,
        }
    }

    pub fn get_id(&self) -> &str {
        match self {
            Self::NormalSweet { id, .. } => id,
            Self::ThankfulFactor { id, .. } => id,
            Self::JumboEnd { id, .. } => id,
            Self::HastyPain { id, .. } => id,
            Self::MistySnow { id, .. } => id,
            Self::DistinctFailure { id, .. } => id,
            Self::PracticalPrinciple { id, .. } => id,
            Self::LimpingStep { id, .. } => id,
            Self::VibrantExcitement { id, .. } => id,
            Self::ActiveDiamond { id, .. } => id,
            Self::PopularLimit { id, .. } => id,
            Self::FalseMirror { id, .. } => id,
            Self::PrimaryBlock { id, .. } => id,
            Self::RotatingRatio { id, .. } => id,
            Self::ColorfulCover { id, .. } => id,
            Self::DisloyalValue { id, .. } => id,
            Self::GruesomeCoach { id, .. } => id,
            Self::TotalWork { id, .. } => id,
            Self::HarmoniousPlay { id, .. } => id,
            Self::UniqueStress { id, .. } => id,
            Self::UnwillingSmoke { id, .. } => id,
            Self::FrozenSleep { id, .. } => id,
            Self::DiligentDeal { id, .. } => id,
            Self::AttractiveScript { id, .. } => id,
            Self::HoarseMouse { id, .. } => id,
            Self::CircularCard { id, .. } => id,
            Self::PotableBad { id, .. } => id,
            Self::TriangularRepair { id, .. } => id,
            Self::GaseousRoad { id, .. } => id,
        }
    }

    pub fn get_created_at(&self) -> &DateTime<FixedOffset> {
        match self {
            Self::NormalSweet { created_at, .. } => created_at,
            Self::ThankfulFactor { created_at, .. } => created_at,
            Self::JumboEnd { created_at, .. } => created_at,
            Self::HastyPain { created_at, .. } => created_at,
            Self::MistySnow { created_at, .. } => created_at,
            Self::DistinctFailure { created_at, .. } => created_at,
            Self::PracticalPrinciple { created_at, .. } => created_at,
            Self::LimpingStep { created_at, .. } => created_at,
            Self::VibrantExcitement { created_at, .. } => created_at,
            Self::ActiveDiamond { created_at, .. } => created_at,
            Self::PopularLimit { created_at, .. } => created_at,
            Self::FalseMirror { created_at, .. } => created_at,
            Self::PrimaryBlock { created_at, .. } => created_at,
            Self::RotatingRatio { created_at, .. } => created_at,
            Self::ColorfulCover { created_at, .. } => created_at,
            Self::DisloyalValue { created_at, .. } => created_at,
            Self::GruesomeCoach { created_at, .. } => created_at,
            Self::TotalWork { created_at, .. } => created_at,
            Self::HarmoniousPlay { created_at, .. } => created_at,
            Self::UniqueStress { created_at, .. } => created_at,
            Self::UnwillingSmoke { created_at, .. } => created_at,
            Self::FrozenSleep { created_at, .. } => created_at,
            Self::DiligentDeal { created_at, .. } => created_at,
            Self::AttractiveScript { created_at, .. } => created_at,
            Self::HoarseMouse { created_at, .. } => created_at,
            Self::CircularCard { created_at, .. } => created_at,
            Self::PotableBad { created_at, .. } => created_at,
            Self::TriangularRepair { created_at, .. } => created_at,
            Self::GaseousRoad { created_at, .. } => created_at,
        }
    }

    pub fn get_archived_at(&self) -> &Option<DateTime<FixedOffset>> {
        match self {
            Self::NormalSweet { archived_at, .. } => archived_at,
            Self::ThankfulFactor { archived_at, .. } => archived_at,
            Self::JumboEnd { archived_at, .. } => archived_at,
            Self::HastyPain { archived_at, .. } => archived_at,
            Self::MistySnow { archived_at, .. } => archived_at,
            Self::DistinctFailure { archived_at, .. } => archived_at,
            Self::PracticalPrinciple { archived_at, .. } => archived_at,
            Self::LimpingStep { archived_at, .. } => archived_at,
            Self::VibrantExcitement { archived_at, .. } => archived_at,
            Self::ActiveDiamond { archived_at, .. } => archived_at,
            Self::PopularLimit { archived_at, .. } => archived_at,
            Self::FalseMirror { archived_at, .. } => archived_at,
            Self::PrimaryBlock { archived_at, .. } => archived_at,
            Self::RotatingRatio { archived_at, .. } => archived_at,
            Self::ColorfulCover { archived_at, .. } => archived_at,
            Self::DisloyalValue { archived_at, .. } => archived_at,
            Self::GruesomeCoach { archived_at, .. } => archived_at,
            Self::TotalWork { archived_at, .. } => archived_at,
            Self::HarmoniousPlay { archived_at, .. } => archived_at,
            Self::UniqueStress { archived_at, .. } => archived_at,
            Self::UnwillingSmoke { archived_at, .. } => archived_at,
            Self::FrozenSleep { archived_at, .. } => archived_at,
            Self::DiligentDeal { archived_at, .. } => archived_at,
            Self::AttractiveScript { archived_at, .. } => archived_at,
            Self::HoarseMouse { archived_at, .. } => archived_at,
            Self::CircularCard { archived_at, .. } => archived_at,
            Self::PotableBad { archived_at, .. } => archived_at,
            Self::TriangularRepair { archived_at, .. } => archived_at,
            Self::GaseousRoad { archived_at, .. } => archived_at,
        }
    }
}
