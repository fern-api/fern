import * as serializers from "../../../index";
import * as SeedApi from "../../../../api/index";
import * as core from "../../../../core";
export declare const Movie: core.serialization.ObjectSchema<serializers.Movie.Raw, SeedApi.Movie>;
export declare namespace Movie {
    interface Raw {
        id: serializers.MovieId.Raw;
        title: string;
        rating: number;
    }
}
