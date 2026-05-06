package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.BulkUpdateTasksRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.bulkUpdateTasks(BulkUpdateTasksRequest.builder()
                .assignedTo("assigned_to")
                .isComplete("is_complete")
                .date("date")
                .fields("_fields")
                .bulkUpdateTasksRequestAssignedTo("assigned_to")
                .bulkUpdateTasksRequestDate("2023-01-15")
                .bulkUpdateTasksRequestIsComplete(true)
                .text("text")
                .build());
    }
}
