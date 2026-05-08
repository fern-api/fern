package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesWeatherReport;

public class Example31 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().enum_().getAndReturnEnum(TypesWeatherReport.SUNNY);
    }
}