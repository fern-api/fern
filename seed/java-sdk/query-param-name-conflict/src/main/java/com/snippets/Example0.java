package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.BulkUpdateTasksRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.bulkUpdateTasks(BulkUpdateTasksRequest.builder().build());
    }
}
