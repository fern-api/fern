use seed_unions::prelude::*;
use seed_unions::{
    ActiveDiamond, AttractiveScript, BigUnion, CircularCard, ColorfulCover, DiligentDeal,
    DisloyalValue, DistinctFailure, FalseMirror, FrozenSleep, GaseousRoad, GruesomeCoach,
    HarmoniousPlay, HastyPain, HoarseMouse, JumboEnd, LimpingStep, MistySnow, NormalSweet,
    PopularLimit, PotableBad, PracticalPrinciple, PrimaryBlock, RotatingRatio, ThankfulFactor,
    TotalWork, TriangularRepair, UniqueStress, UnwillingSmoke, VibrantExcitement,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client
        .bigunion
        .update_many(
            &vec![
                BigUnion::NormalSweet {
                    data: NormalSweet {
                        value: "value".to_string(),
                    },
                },
                BigUnion::NormalSweet {
                    data: NormalSweet {
                        value: "value".to_string(),
                    },
                },
            ],
            None,
        )
        .await;
}
