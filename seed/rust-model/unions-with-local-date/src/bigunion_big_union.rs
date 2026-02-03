pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum BigUnion {
        #[serde(rename = "normalSweet")]
        NormalSweet {
            #[serde(flatten)]
            data: NormalSweet,
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
        ThankfulFactor {
            #[serde(flatten)]
            data: ThankfulFactor,
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
        JumboEnd {
            #[serde(flatten)]
            data: JumboEnd,
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
        HastyPain {
            #[serde(flatten)]
            data: HastyPain,
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
        MistySnow {
            #[serde(flatten)]
            data: MistySnow,
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
        DistinctFailure {
            #[serde(flatten)]
            data: DistinctFailure,
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
        PracticalPrinciple {
            #[serde(flatten)]
            data: PracticalPrinciple,
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
        LimpingStep {
            #[serde(flatten)]
            data: LimpingStep,
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
        VibrantExcitement {
            #[serde(flatten)]
            data: VibrantExcitement,
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
        ActiveDiamond {
            #[serde(flatten)]
            data: ActiveDiamond,
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
        PopularLimit {
            #[serde(flatten)]
            data: PopularLimit,
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
        FalseMirror {
            #[serde(flatten)]
            data: FalseMirror,
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
        PrimaryBlock {
            #[serde(flatten)]
            data: PrimaryBlock,
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
        RotatingRatio {
            #[serde(flatten)]
            data: RotatingRatio,
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
        ColorfulCover {
            #[serde(flatten)]
            data: ColorfulCover,
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
        DisloyalValue {
            #[serde(flatten)]
            data: DisloyalValue,
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
        GruesomeCoach {
            #[serde(flatten)]
            data: GruesomeCoach,
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
        TotalWork {
            #[serde(flatten)]
            data: TotalWork,
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
        HarmoniousPlay {
            #[serde(flatten)]
            data: HarmoniousPlay,
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
        UniqueStress {
            #[serde(flatten)]
            data: UniqueStress,
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
        UnwillingSmoke {
            #[serde(flatten)]
            data: UnwillingSmoke,
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
        FrozenSleep {
            #[serde(flatten)]
            data: FrozenSleep,
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
        DiligentDeal {
            #[serde(flatten)]
            data: DiligentDeal,
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
        AttractiveScript {
            #[serde(flatten)]
            data: AttractiveScript,
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
        HoarseMouse {
            #[serde(flatten)]
            data: HoarseMouse,
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
        CircularCard {
            #[serde(flatten)]
            data: CircularCard,
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
        PotableBad {
            #[serde(flatten)]
            data: PotableBad,
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
        TriangularRepair {
            #[serde(flatten)]
            data: TriangularRepair,
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
        GaseousRoad {
            #[serde(flatten)]
            data: GaseousRoad,
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
