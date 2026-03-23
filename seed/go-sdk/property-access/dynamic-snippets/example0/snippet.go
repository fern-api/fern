package example

import (
    context "context"
    fern "github.com/property-access/fern"
    client "github.com/property-access/fern/client"
    option "github.com/property-access/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.User{
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
    }
    client.CreateUser(
        context.TODO(),
        request,
    )
}
