package example

import (
    client "github.com/property-access/fern/client"
    option "github.com/property-access/fern/option"
    context "context"
    fern "github.com/property-access/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.CreateUser(
        context.TODO(),
        &fern.User{
            Id: "id",
            Email: "email",
            Password: "password",
            Profile: &fern.UserProfile{
                Name: "name",
                Verification: &fern.UserProfileVerification{
                    Verified: "verified",
                },
                Ssn: "ssn",
            },
        },
    )
}
