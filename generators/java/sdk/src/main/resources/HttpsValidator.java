import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Validates that URLs use HTTPS for non-localhost hosts, preventing
 * accidental transmission of credentials in plaintext.
 */
public final class HttpsValidator {

    private static final Set<String> LOCALHOST_HOSTS = new HashSet<>(Arrays.asList(
            "localhost", "127.0.0.1", "[::1]"
    ));

    private HttpsValidator() {}

    /**
     * Validates that the given URL uses HTTPS for non-localhost hosts.
     * Throws IllegalArgumentException if the URL uses HTTP for a non-localhost host.
     *
     * @param url the URL to validate
     * @throws IllegalArgumentException if the URL uses HTTP for a non-localhost host
     */
    public static void validateHttps(String url) {
        URI parsed;
        try {
            parsed = new URI(url);
        } catch (URISyntaxException e) {
            return;
        }
        String scheme = parsed.getScheme();
        if (scheme == null || !scheme.equalsIgnoreCase("http")) {
            return;
        }
        String host = parsed.getHost();
        if (host != null && (LOCALHOST_HOSTS.contains(host.toLowerCase()) || host.toLowerCase().endsWith(".localhost"))) {
            return;
        }
        throw new IllegalArgumentException(
                "Refusing to send request to non-HTTPS URL: " + url
                        + ". HTTP is only allowed for localhost. Use HTTPS or pass a localhost URL."
        );
    }
}
