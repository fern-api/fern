package example

import (
    client "github.com/inline-path-params-test/fern/client"
    option "github.com/inline-path-params-test/fern/option"
    fern "github.com/inline-path-params-test/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UserSettings{
        UserId: "user_id",
        NotificationsEnabled: fern.Bool(
            true,
        ),
        Theme: fern.UserSettingsThemeLight.Ptr(),
    }
    client.Users.UpdateUserSettings(
        context.TODO(),
        request,
    )
}
