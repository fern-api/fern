import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import okhttp3.Headers;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

/**
 * Utility for URI-based pagination where the response contains a full URL for the next page.
 */
public final class UriPage {

    private UriPage() {}

    /**
     * Creates a {@link SyncPagingIterable} from an initial parsed response, using the provided
     * next URI to fetch subsequent pages.
     *
     * @param <T>              the item type
     * @param <R>              the response type
     * @param initialResponse  the parsed response from the initial request
     * @param nextUri          the next page URI extracted from the response (empty if no more pages)
     * @param items            the items extracted from the initial response
     * @param responseClass    the class of the response type for deserialization
     * @param getNext          function to extract the next URI from a parsed response
     * @param getItems         function to extract the items list from a parsed response
     * @param httpMethod       the HTTP method to use for follow-up requests (e.g., "GET", "POST")
     * @param requestBody      the request body for follow-up requests (null for GET)
     * @param additionalHeaders extra headers to include (e.g., Accept, Content-Type)
     * @param clientOptions    the client options for making HTTP requests
     * @param requestOptions   the request options (headers, timeout, etc.)
     * @return a {@link SyncPagingIterable} that lazily fetches subsequent pages
     */
    public static <T, R> SyncPagingIterable<T> create(
            R initialResponse,
            Optional<String> nextUri,
            List<T> items,
            Class<R> responseClass,
            Function<R, Optional<String>> getNext,
            Function<R, List<T>> getItems,
            String httpMethod,
            RequestBody requestBody,
            Headers additionalHeaders,
            ClientOptions clientOptions,
            RequestOptions requestOptions) {
        return new SyncPagingIterable<>(
                nextUri.isPresent(),
                items,
                initialResponse,
                nextUri.isPresent()
                        ? () -> fetchPage(
                                nextUri.get(),
                                responseClass,
                                getNext,
                                getItems,
                                httpMethod,
                                requestBody,
                                additionalHeaders,
                                clientOptions,
                                requestOptions)
                        : () -> null);
    }

    private static <T, R> SyncPagingIterable<T> fetchPage(
            String url,
            Class<R> responseClass,
            Function<R, Optional<String>> getNext,
            Function<R, List<T>> getItems,
            String httpMethod,
            RequestBody requestBody,
            Headers additionalHeaders,
            ClientOptions clientOptions,
            RequestOptions requestOptions) {
        Request.Builder requestBuilder = new Request.Builder()
                .url(url)
                .method(httpMethod, requestBody)
                .headers(Headers.of(clientOptions.headers(requestOptions)));
        for (int i = 0; i < additionalHeaders.size(); i++) {
            requestBuilder.addHeader(additionalHeaders.name(i), additionalHeaders.value(i));
        }
        Request okhttpRequest = requestBuilder.build();
        OkHttpClient client = clientOptions.httpClient();
        if (requestOptions != null && requestOptions.getTimeout().isPresent()) {
            client = clientOptions.httpClientWithTimeout(requestOptions);
        }
        try (Response response = client.newCall(okhttpRequest).execute()) {
            ResponseBody responseBody = response.body();
            String responseBodyString = responseBody != null ? responseBody.string() : "{}";
            if (response.isSuccessful()) {
                R parsedResponse = ObjectMappers.JSON_MAPPER.readValue(responseBodyString, responseClass);
                Optional<String> nextUrl = getNext.apply(parsedResponse);
                List<T> results = getItems.apply(parsedResponse);
                return new SyncPagingIterable<>(
                        nextUrl.isPresent(),
                        results,
                        parsedResponse,
                        nextUrl.isPresent()
                                ? () -> fetchPage(
                                        nextUrl.get(),
                                        responseClass,
                                        getNext,
                                        getItems,
                                        httpMethod,
                                        requestBody,
                                        additionalHeaders,
                                        clientOptions,
                                        requestOptions)
                                : () -> null);
            }
            Object errorBody = ObjectMappers.parseErrorBody(responseBodyString);
            throw new __API_EXCEPTION__(
                    "Error with status code " + response.code(), response.code(), errorBody, response);
        } catch (IOException e) {
            throw new __BASE_EXCEPTION__("Network error executing HTTP request", e);
        }
    }
}
