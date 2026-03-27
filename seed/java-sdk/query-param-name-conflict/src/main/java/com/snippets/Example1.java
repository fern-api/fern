package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.BulkUpdateTasksRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.bulkUpdateTasks(BulkUpdateTasksRequest.builder()
                .filterAssignedTo("filter_assigned_to")
                .filterIsComplete("filter_is_complete")
                .filterDate("filter_date")
                .fields("_fields")
                .assignedTo("assigned_to")
                .date("2023-01-15")
                .isComplete(true)
                .text("text")
                .build());
    }
}
