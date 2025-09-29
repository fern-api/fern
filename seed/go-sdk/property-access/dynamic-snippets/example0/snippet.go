package example

import (
    client "github.com/property-access/fern/client"
    option "github.com/property-access/fern/option"
    fern "github.com/property-access/fern"
    context "context"
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
