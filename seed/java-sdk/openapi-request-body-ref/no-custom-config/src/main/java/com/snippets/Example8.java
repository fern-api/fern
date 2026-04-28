package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.teammember.requests.UpdateTeamMemberRequest;

public class Example8 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.teamMember()
                .updateTeamMember(
                        "team_member_id",
                        UpdateTeamMemberRequest.builder()
                                .givenName("given_name")
                                .familyName("family_name")
                                .emailAddress("email_address")
                                .build());
    }
}
