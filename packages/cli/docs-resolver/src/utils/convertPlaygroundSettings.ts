import { docsYml } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";

export function convertPlaygroundSettings(
    playgroundSettings?: docsYml.RawSchemas.PlaygroundSettings
): FernNavigation.V1.PlaygroundSettings | undefined {
    if (playgroundSettings) {
        return {
            environments:
                playgroundSettings.environments != null && playgroundSettings.environments.length > 0
                    ? playgroundSettings.environments.map((environmentId) =>
                          FernNavigation.V1.EnvironmentId(environmentId)
                      )
                    : undefined,
            button:
                playgroundSettings.button != null && playgroundSettings.button.href
                    ? { href: FernNavigation.V1.Url(playgroundSettings.button.href) }
                    : undefined,
            "limit-websocket-messages-per-connection":
                playgroundSettings.limitWebsocketMessagesPerConnection != null
                    ? playgroundSettings.limitWebsocketMessagesPerConnection
                    : undefined,
            hidden:
                playgroundSettings.hidden != null && playgroundSettings.hidden ? playgroundSettings.hidden : undefined
        };
    }

    return;
}
