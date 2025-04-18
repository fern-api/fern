/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as core from "../../../../core";
import * as serializers from "../../../index";
import * as SeedUnions from "../../../../api/index";

const _Base = core.serialization.object({
    id: core.serialization.string(),
    createdAt: core.serialization.property("created-at", core.serialization.date()),
    archivedAt: core.serialization.property("archived-at", core.serialization.date().optional()),
});
export const BigUnion: core.serialization.Schema<serializers.BigUnion.Raw, SeedUnions.BigUnion> = core.serialization
    .union("type", {
        normalSweet: core.serialization.lazyObject(() => serializers.NormalSweet).extend(_Base),
        thankfulFactor: core.serialization.lazyObject(() => serializers.ThankfulFactor).extend(_Base),
        jumboEnd: core.serialization.lazyObject(() => serializers.JumboEnd).extend(_Base),
        hastyPain: core.serialization.lazyObject(() => serializers.HastyPain).extend(_Base),
        mistySnow: core.serialization.lazyObject(() => serializers.MistySnow).extend(_Base),
        distinctFailure: core.serialization.lazyObject(() => serializers.DistinctFailure).extend(_Base),
        practicalPrinciple: core.serialization.lazyObject(() => serializers.PracticalPrinciple).extend(_Base),
        limpingStep: core.serialization.lazyObject(() => serializers.LimpingStep).extend(_Base),
        vibrantExcitement: core.serialization.lazyObject(() => serializers.VibrantExcitement).extend(_Base),
        activeDiamond: core.serialization.lazyObject(() => serializers.ActiveDiamond).extend(_Base),
        popularLimit: core.serialization.lazyObject(() => serializers.PopularLimit).extend(_Base),
        falseMirror: core.serialization.lazyObject(() => serializers.FalseMirror).extend(_Base),
        primaryBlock: core.serialization.lazyObject(() => serializers.PrimaryBlock).extend(_Base),
        rotatingRatio: core.serialization.lazyObject(() => serializers.RotatingRatio).extend(_Base),
        colorfulCover: core.serialization.lazyObject(() => serializers.ColorfulCover).extend(_Base),
        disloyalValue: core.serialization.lazyObject(() => serializers.DisloyalValue).extend(_Base),
        gruesomeCoach: core.serialization.lazyObject(() => serializers.GruesomeCoach).extend(_Base),
        totalWork: core.serialization.lazyObject(() => serializers.TotalWork).extend(_Base),
        harmoniousPlay: core.serialization.lazyObject(() => serializers.HarmoniousPlay).extend(_Base),
        uniqueStress: core.serialization.lazyObject(() => serializers.UniqueStress).extend(_Base),
        unwillingSmoke: core.serialization.lazyObject(() => serializers.UnwillingSmoke).extend(_Base),
        frozenSleep: core.serialization.lazyObject(() => serializers.FrozenSleep).extend(_Base),
        diligentDeal: core.serialization.lazyObject(() => serializers.DiligentDeal).extend(_Base),
        attractiveScript: core.serialization.lazyObject(() => serializers.AttractiveScript).extend(_Base),
        hoarseMouse: core.serialization.lazyObject(() => serializers.HoarseMouse).extend(_Base),
        circularCard: core.serialization.lazyObject(() => serializers.CircularCard).extend(_Base),
        potableBad: core.serialization.lazyObject(() => serializers.PotableBad).extend(_Base),
        triangularRepair: core.serialization.lazyObject(() => serializers.TriangularRepair).extend(_Base),
        gaseousRoad: core.serialization.lazyObject(() => serializers.GaseousRoad).extend(_Base),
    })
    .transform<SeedUnions.BigUnion>({
        transform: (value) => value,
        untransform: (value) => value,
    });

export declare namespace BigUnion {
    export type Raw =
        | BigUnion.NormalSweet
        | BigUnion.ThankfulFactor
        | BigUnion.JumboEnd
        | BigUnion.HastyPain
        | BigUnion.MistySnow
        | BigUnion.DistinctFailure
        | BigUnion.PracticalPrinciple
        | BigUnion.LimpingStep
        | BigUnion.VibrantExcitement
        | BigUnion.ActiveDiamond
        | BigUnion.PopularLimit
        | BigUnion.FalseMirror
        | BigUnion.PrimaryBlock
        | BigUnion.RotatingRatio
        | BigUnion.ColorfulCover
        | BigUnion.DisloyalValue
        | BigUnion.GruesomeCoach
        | BigUnion.TotalWork
        | BigUnion.HarmoniousPlay
        | BigUnion.UniqueStress
        | BigUnion.UnwillingSmoke
        | BigUnion.FrozenSleep
        | BigUnion.DiligentDeal
        | BigUnion.AttractiveScript
        | BigUnion.HoarseMouse
        | BigUnion.CircularCard
        | BigUnion.PotableBad
        | BigUnion.TriangularRepair
        | BigUnion.GaseousRoad;

    export interface NormalSweet extends _Base, serializers.NormalSweet.Raw {
        type: "normalSweet";
    }

    export interface ThankfulFactor extends _Base, serializers.ThankfulFactor.Raw {
        type: "thankfulFactor";
    }

    export interface JumboEnd extends _Base, serializers.JumboEnd.Raw {
        type: "jumboEnd";
    }

    export interface HastyPain extends _Base, serializers.HastyPain.Raw {
        type: "hastyPain";
    }

    export interface MistySnow extends _Base, serializers.MistySnow.Raw {
        type: "mistySnow";
    }

    export interface DistinctFailure extends _Base, serializers.DistinctFailure.Raw {
        type: "distinctFailure";
    }

    export interface PracticalPrinciple extends _Base, serializers.PracticalPrinciple.Raw {
        type: "practicalPrinciple";
    }

    export interface LimpingStep extends _Base, serializers.LimpingStep.Raw {
        type: "limpingStep";
    }

    export interface VibrantExcitement extends _Base, serializers.VibrantExcitement.Raw {
        type: "vibrantExcitement";
    }

    export interface ActiveDiamond extends _Base, serializers.ActiveDiamond.Raw {
        type: "activeDiamond";
    }

    export interface PopularLimit extends _Base, serializers.PopularLimit.Raw {
        type: "popularLimit";
    }

    export interface FalseMirror extends _Base, serializers.FalseMirror.Raw {
        type: "falseMirror";
    }

    export interface PrimaryBlock extends _Base, serializers.PrimaryBlock.Raw {
        type: "primaryBlock";
    }

    export interface RotatingRatio extends _Base, serializers.RotatingRatio.Raw {
        type: "rotatingRatio";
    }

    export interface ColorfulCover extends _Base, serializers.ColorfulCover.Raw {
        type: "colorfulCover";
    }

    export interface DisloyalValue extends _Base, serializers.DisloyalValue.Raw {
        type: "disloyalValue";
    }

    export interface GruesomeCoach extends _Base, serializers.GruesomeCoach.Raw {
        type: "gruesomeCoach";
    }

    export interface TotalWork extends _Base, serializers.TotalWork.Raw {
        type: "totalWork";
    }

    export interface HarmoniousPlay extends _Base, serializers.HarmoniousPlay.Raw {
        type: "harmoniousPlay";
    }

    export interface UniqueStress extends _Base, serializers.UniqueStress.Raw {
        type: "uniqueStress";
    }

    export interface UnwillingSmoke extends _Base, serializers.UnwillingSmoke.Raw {
        type: "unwillingSmoke";
    }

    export interface FrozenSleep extends _Base, serializers.FrozenSleep.Raw {
        type: "frozenSleep";
    }

    export interface DiligentDeal extends _Base, serializers.DiligentDeal.Raw {
        type: "diligentDeal";
    }

    export interface AttractiveScript extends _Base, serializers.AttractiveScript.Raw {
        type: "attractiveScript";
    }

    export interface HoarseMouse extends _Base, serializers.HoarseMouse.Raw {
        type: "hoarseMouse";
    }

    export interface CircularCard extends _Base, serializers.CircularCard.Raw {
        type: "circularCard";
    }

    export interface PotableBad extends _Base, serializers.PotableBad.Raw {
        type: "potableBad";
    }

    export interface TriangularRepair extends _Base, serializers.TriangularRepair.Raw {
        type: "triangularRepair";
    }

    export interface GaseousRoad extends _Base, serializers.GaseousRoad.Raw {
        type: "gaseousRoad";
    }

    export interface _Base {
        id: string;
        "created-at": string;
        "archived-at"?: string | null;
    }
}
