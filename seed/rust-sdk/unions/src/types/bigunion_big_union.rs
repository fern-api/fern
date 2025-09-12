use crate::bigunion_active_diamond::ActiveDiamond;
use crate::bigunion_attractive_script::AttractiveScript;
use crate::bigunion_circular_card::CircularCard;
use crate::bigunion_colorful_cover::ColorfulCover;
use crate::bigunion_diligent_deal::DiligentDeal;
use crate::bigunion_disloyal_value::DisloyalValue;
use crate::bigunion_distinct_failure::DistinctFailure;
use crate::bigunion_false_mirror::FalseMirror;
use crate::bigunion_frozen_sleep::FrozenSleep;
use crate::bigunion_gaseous_road::GaseousRoad;
use crate::bigunion_gruesome_coach::GruesomeCoach;
use crate::bigunion_harmonious_play::HarmoniousPlay;
use crate::bigunion_hasty_pain::HastyPain;
use crate::bigunion_hoarse_mouse::HoarseMouse;
use crate::bigunion_jumbo_end::JumboEnd;
use crate::bigunion_limping_step::LimpingStep;
use crate::bigunion_misty_snow::MistySnow;
use crate::bigunion_normal_sweet::NormalSweet;
use crate::bigunion_popular_limit::PopularLimit;
use crate::bigunion_potable_bad::PotableBad;
use crate::bigunion_practical_principle::PracticalPrinciple;
use crate::bigunion_primary_block::PrimaryBlock;
use crate::bigunion_rotating_ratio::RotatingRatio;
use crate::bigunion_thankful_factor::ThankfulFactor;
use crate::bigunion_total_work::TotalWork;
use crate::bigunion_triangular_repair::TriangularRepair;
use crate::bigunion_unique_stress::UniqueStress;
use crate::bigunion_unwilling_smoke::UnwillingSmoke;
use crate::bigunion_vibrant_excitement::VibrantExcitement;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum BigUnion {
    NormalSweet {
        #[serde(flatten)]
        data: NormalSweet,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    ThankfulFactor {
        #[serde(flatten)]
        data: ThankfulFactor,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    JumboEnd {
        #[serde(flatten)]
        data: JumboEnd,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    HastyPain {
        #[serde(flatten)]
        data: HastyPain,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    MistySnow {
        #[serde(flatten)]
        data: MistySnow,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    DistinctFailure {
        #[serde(flatten)]
        data: DistinctFailure,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    PracticalPrinciple {
        #[serde(flatten)]
        data: PracticalPrinciple,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    LimpingStep {
        #[serde(flatten)]
        data: LimpingStep,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    VibrantExcitement {
        #[serde(flatten)]
        data: VibrantExcitement,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    ActiveDiamond {
        #[serde(flatten)]
        data: ActiveDiamond,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    PopularLimit {
        #[serde(flatten)]
        data: PopularLimit,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    FalseMirror {
        #[serde(flatten)]
        data: FalseMirror,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    PrimaryBlock {
        #[serde(flatten)]
        data: PrimaryBlock,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    RotatingRatio {
        #[serde(flatten)]
        data: RotatingRatio,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    ColorfulCover {
        #[serde(flatten)]
        data: ColorfulCover,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    DisloyalValue {
        #[serde(flatten)]
        data: DisloyalValue,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    GruesomeCoach {
        #[serde(flatten)]
        data: GruesomeCoach,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    TotalWork {
        #[serde(flatten)]
        data: TotalWork,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    HarmoniousPlay {
        #[serde(flatten)]
        data: HarmoniousPlay,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    UniqueStress {
        #[serde(flatten)]
        data: UniqueStress,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    UnwillingSmoke {
        #[serde(flatten)]
        data: UnwillingSmoke,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    FrozenSleep {
        #[serde(flatten)]
        data: FrozenSleep,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    DiligentDeal {
        #[serde(flatten)]
        data: DiligentDeal,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    AttractiveScript {
        #[serde(flatten)]
        data: AttractiveScript,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    HoarseMouse {
        #[serde(flatten)]
        data: HoarseMouse,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    CircularCard {
        #[serde(flatten)]
        data: CircularCard,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    PotableBad {
        #[serde(flatten)]
        data: PotableBad,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    TriangularRepair {
        #[serde(flatten)]
        data: TriangularRepair,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },

    GaseousRoad {
        #[serde(flatten)]
        data: GaseousRoad,
        id: String,
        #[serde(rename = "created-at")]
        created_at: chrono::DateTime<chrono::Utc>,
        #[serde(rename = "archived-at")]
        #[serde(skip_serializing_if = "Option::is_none")]
        archived_at: Option<chrono::DateTime<chrono::Utc>>,
    },
}

impl BigUnion {
    pub fn get_id(&self) -> &String {
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

    pub fn get_created_at(&self) -> &chrono::DateTime<chrono::Utc> {
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

    pub fn get_archived_at(&self) -> &Option<chrono::DateTime<chrono::Utc>> {
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
