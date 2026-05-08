export declare const TypesWeatherReport: {
    readonly Sunny: "SUNNY";
    readonly Cloudy: "CLOUDY";
    readonly Raining: "RAINING";
    readonly Snowing: "SNOWING";
};
export type TypesWeatherReport = (typeof TypesWeatherReport)[keyof typeof TypesWeatherReport];
