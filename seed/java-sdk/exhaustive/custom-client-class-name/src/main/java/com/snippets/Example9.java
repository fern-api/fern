package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.enum_.types.WeatherReport;

public class Example9 {
    public static void main(String[] args) {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().enum_().getAndReturnEnum(WeatherReport.SUNNY);
    }
}