use seed_unions::{
    ActiveDiamond, AttractiveScript, BigUnion, Circle, CircularCard, ClientConfig, ColorfulCover,
    DiligentDeal, DisloyalValue, DistinctFailure, FalseMirror, FrozenSleep, GaseousRoad,
    GruesomeCoach, HarmoniousPlay, HastyPain, HoarseMouse, JumboEnd, LimpingStep, MistySnow,
    NormalSweet, PopularLimit, PotableBad, PracticalPrinciple, PrimaryBlock, RotatingRatio, Shape,
    ThankfulFactor, TotalWork, TriangularRepair, UnionsClient, UniqueStress, UnwillingSmoke,
    VibrantExcitement,
};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion.update(&Default::default(), None).await;
}
