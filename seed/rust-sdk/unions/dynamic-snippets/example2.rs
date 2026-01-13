use seed_unions::prelude::{*};
use seed_unions::{BigUnion, NormalSweet, ThankfulFactor, JumboEnd, HastyPain, MistySnow, DistinctFailure, PracticalPrinciple, LimpingStep, VibrantExcitement, ActiveDiamond, PopularLimit, FalseMirror, PrimaryBlock, RotatingRatio, ColorfulCover, DisloyalValue, GruesomeCoach, TotalWork, HarmoniousPlay, UniqueStress, UnwillingSmoke, FrozenSleep, DiligentDeal, AttractiveScript, HoarseMouse, CircularCard, PotableBad, TriangularRepair, GaseousRoad};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion.update_many(&vec![BigUnion::NormalSweet {
        data: NormalSweet {
            value: "value".to_string()
        }
    }, BigUnion::NormalSweet {
        data: NormalSweet {
            value: "value".to_string()
        }
    }], None).await;
}
