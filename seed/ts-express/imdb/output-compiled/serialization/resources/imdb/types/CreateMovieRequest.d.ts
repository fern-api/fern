import type * as SeedApi from "../../../../api/index";
import * as core from "../../../../core";
import type * as serializers from "../../../index";
export declare const CreateMovieRequest: core.serialization.ObjectSchema<serializers.CreateMovieRequest.Raw, SeedApi.CreateMovieRequest>;
export declare namespace CreateMovieRequest {
    interface Raw {
        title: string;
        rating: number;
    }
}
