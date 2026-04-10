package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TypesWeatherReport;

public class Example21 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsEnum().endpointsEnumGetAndReturnEnum(TypesWeatherReport.SUNNY);
    }
}
