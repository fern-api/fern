import okhttp3.Response;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class <%= httpResponseClassName%><T> {

    private final T body;

    private final int statusCode;

    private final Map<String, List<String>> headers;

    public <%= httpResponseClassName%>(T body, Response rawResponse) {
        this.body = body;
        this.statusCode = rawResponse.code();

        Map<String, List<String>> headers = new HashMap<>();
        rawResponse.headers().forEach(header -> {
            String key = header.component1();
            String value = header.component2();
            headers.computeIfAbsent(key, _str -> new ArrayList<>()).add(value);
        });
        this.headers = headers;
    }

    public T body() {
        return this.body;
    }

    /**
     * The HTTP status code of the response. Two successful statuses can mean different things -
     * 202 says the request was accepted and is still running where 200 says it is done, and 201
     * says something was created - and the body does not always say which happened.
     */
    public int statusCode() {
        return this.statusCode;
    }

    public Map<String, List<String>> headers() {
        return headers;
    }
}
