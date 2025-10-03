export declare const WeatherReport: {
    readonly Sunny: "SUNNY";
    readonly Cloudy: "CLOUDY";
    readonly Raining: "RAINING";
    readonly Snowing: "SNOWING";
};
export type WeatherReport = (typeof WeatherReport)[keyof typeof WeatherReport];
