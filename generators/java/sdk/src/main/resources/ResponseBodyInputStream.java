import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import okhttp3.Response;

/**
 * A custom InputStream that wraps the original InputStream and ensures that the
 * OkHttp Response object is properly closed when the stream is closed.
 *
 * This class extends FilterInputStream and takes an OkHttp Response object as an additional
 * parameter. It overrides the close method to close both the InputStream and the Response
 * object, ensuring proper resource management and preventing premature closure of the underlying
 * HTTP connection.
 */
public class ResponseBodyInputStream extends FilterInputStream {
    private final Response response;

    /**
     * Constructs a ResponseBodyInputStream that wraps the given InputStream and associates it
     * with the provided OkHttp Response object.
     *
     * @param in the original InputStream to be wrapped
     * @param response the OkHttp Response object associated with the InputStream
     */
    public ResponseBodyInputStream(InputStream in, Response response) {
        super(in);
        this.response = response;
    }

    /**
     * Closes the InputStream and the associated OkHttp Response object. This ensures that the
     * underlying HTTP connection is properly closed after the stream is no longer needed.
     *
     * @throws IOException if an I/O error occurs
     */
    @Override
    public void close() throws IOException {
        super.close();
        response.close(); // Ensure the response is closed when the stream is closed
    }
}
