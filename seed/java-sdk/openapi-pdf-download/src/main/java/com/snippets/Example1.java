package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.AssetReportPdfGetRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.assetReport()
                .getPdf(AssetReportPdfGetRequest.builder()
                        .assetReportToken("asset_report_token")
                        .build());
    }
}
