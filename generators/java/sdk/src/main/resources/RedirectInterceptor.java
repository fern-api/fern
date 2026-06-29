import java.io.IOException;
import java.net.URI;
import java.util.HashSet;
import java.util.Set;
import okhttp3.HttpUrl;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class RedirectInterceptor implements Interceptor {

    private static final int MAX_REDIRECTS = 20;
    private static final Set<Integer> REDIRECT_STATUS_CODES = new HashSet<>();

    static {
        REDIRECT_STATUS_CODES.add(301);
        REDIRECT_STATUS_CODES.add(302);
        REDIRECT_STATUS_CODES.add(303);
        REDIRECT_STATUS_CODES.add(307);
        REDIRECT_STATUS_CODES.add(308);
    }

    private final Set<String> authHeaderKeys;

    public RedirectInterceptor(Set<String> authHeaderKeys) {
        this.authHeaderKeys = new HashSet<>();
        for (String key : authHeaderKeys) {
            this.authHeaderKeys.add(key.toLowerCase());
        }
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        Request request = chain.request();
        Response response = chain.proceed(request);
        int redirectCount = 0;

        while (REDIRECT_STATUS_CODES.contains(response.code()) && redirectCount < MAX_REDIRECTS) {
            String location = response.header("Location");
            if (location == null) {
                break;
            }

            HttpUrl redirectUrl = request.url().resolve(location);
            if (redirectUrl == null) {
                break;
            }
            redirectCount++;

            String method = request.method();
            okhttp3.RequestBody body = request.body();

            // 301, 302, 303: switch to GET and drop body
            if (response.code() == 301 || response.code() == 302 || response.code() == 303) {
                method = "GET";
                body = null;
            }

            Request.Builder redirectBuilder = request.newBuilder()
                    .url(redirectUrl)
                    .method(method, body);

            // Strip auth headers on cross-origin redirects
            if (!isSameOrigin(request.url(), redirectUrl)) {
                for (String headerName : request.headers().names()) {
                    if (authHeaderKeys.contains(headerName.toLowerCase())) {
                        redirectBuilder.removeHeader(headerName);
                    }
                }
            }

            response.close();
            request = redirectBuilder.build();
            response = chain.proceed(request);
        }

        return response;
    }

    private static boolean isSameOrigin(HttpUrl url1, HttpUrl url2) {
        return url1.scheme().equals(url2.scheme())
                && url1.host().equalsIgnoreCase(url2.host())
                && url1.port() == url2.port();
    }
}
