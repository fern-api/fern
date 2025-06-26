import java.io.Closeable;
import java.io.IOException;
import java.io.Reader;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Scanner;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Iterable stream for parsing JSON and Server-Sent Events (SSE) data.
 * Supports both newline-delimited JSON and SSE with optional stream termination.
 *
 * @param <T> The type of objects in the stream.
 */
public final class Stream<T> implements Iterable<T>, Closeable {

    private static final String NEWLINE = "\n";
    private static final String DATA_PREFIX = "data:";

    public enum StreamType {
        JSON,
        SSE
    }

    private final Class<T> valueType;
    private final Scanner scanner;
    private final StreamType streamType;
    private final String messageTerminator;
    private final String streamTerminator;
    private final AtomicBoolean isClosed = new AtomicBoolean(false);
    private final Reader sseReader;

    public Stream(Class<T> valueType, Reader reader, String delimiter) {
        this.valueType = valueType;
        this.scanner = new Scanner(reader).useDelimiter(delimiter);
        this.streamType = StreamType.JSON;
        this.messageTerminator = delimiter;
        this.streamTerminator = null;
        this.sseReader = null;
    }

    private Stream(Class<T> valueType, Reader sseReader, String streamTerminator) {
        this.valueType = valueType;
        this.scanner = null;
        this.streamType = StreamType.SSE;
        this.messageTerminator = NEWLINE;
        this.streamTerminator = streamTerminator;
        this.sseReader = sseReader;
    }

    public static <T> Stream<T> fromJson(Class<T> valueType, Reader reader, String delimiter) {
        return new Stream<>(valueType, reader, delimiter);
    }

    public static <T> Stream<T> fromJson(Class<T> valueType, Reader reader) {
        return new Stream<>(valueType, reader, NEWLINE);
    }

    public static <T> Stream<T> fromSse(Class<T> valueType, Reader sseReader) {
        return new Stream<>(valueType, sseReader, null);
    }

    public static <T> Stream<T> fromSse(Class<T> valueType, Reader sseReader, String streamTerminator) {
        return new Stream<>(valueType, sseReader, streamTerminator);
    }

    @Override
    public void close() throws IOException {
        if (isClosed.compareAndSet(false, true)) {
            if (scanner != null) {
                scanner.close();
            }
        }
    }

    private boolean isStreamClosed() {
        return isClosed.get();
    }
    @Override
    public Iterator<T> iterator() {
        if (streamType == StreamType.SSE) {
            return new SSEIterator();
        } else {
            return new JsonIterator();
        }
    }

    private final class JsonIterator implements Iterator<T> {

        @Override
        public boolean hasNext() {
            if (isStreamClosed()) {
                return false;
            }
            return scanner.hasNext();
        }

        @Override
        public T next() {
            if (isStreamClosed()) {
                throw new NoSuchElementException("Stream is closed");
            }

            if (!scanner.hasNext()) {
                throw new NoSuchElementException();
            } else {
                try {
                    T parsedResponse =
                            ObjectMappers.JSON_MAPPER.readValue(scanner.next().trim(), valueType);
                    return parsedResponse;
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }

        @Override
        public void remove() {
            throw new UnsupportedOperationException();
        }
    }

    private final class SSEIterator implements Iterator<T> {
        private Scanner sseScanner;
        private T nextItem;
        private boolean hasNextItem = false;
        private boolean endOfStream = false;
        private StringBuilder buffer = new StringBuilder();
        private boolean prefixSeen = false;

        private SSEIterator() {
            if (sseReader != null) {
                this.sseScanner = new Scanner(sseReader);
            } else {
                this.endOfStream = true;
            }
        }

        @Override
        public boolean hasNext() {
            if (isStreamClosed() || endOfStream) {
                return false;
            }

            if (hasNextItem) {
                return true;
            }

            return readNextMessage();
        }

        @Override
        public T next() {
            if (!hasNext()) {
                throw new NoSuchElementException("No more elements in stream");
            }

            T result = nextItem;
            nextItem = null;
            hasNextItem = false;
            return result;
        }

        @Override
        public void remove() {
            throw new UnsupportedOperationException();
        }

        private boolean readNextMessage() {
            if (sseScanner == null) {
                endOfStream = true;
                return false;
            }

            try {
                while (sseScanner.hasNextLine()) {
                    String chunk = sseScanner.nextLine();
                    buffer.append(chunk).append(NEWLINE);

                    int terminatorIndex;
                    while ((terminatorIndex = buffer.indexOf(messageTerminator)) >= 0) {
                        String line = buffer.substring(0, terminatorIndex + messageTerminator.length());
                        buffer.delete(0, terminatorIndex + messageTerminator.length());

                        line = line.trim();
                        if (line.isEmpty()) {
                            continue;
                        }

                        if (!prefixSeen && line.startsWith(DATA_PREFIX)) {
                            prefixSeen = true;
                            line = line.substring(DATA_PREFIX.length()).trim();
                        } else if (!prefixSeen) {
                            continue;
                        }

                        if (streamTerminator != null && line.contains(streamTerminator)) {
                            endOfStream = true;
                            return false;
                        }

                        try {
                            nextItem = ObjectMappers.JSON_MAPPER.readValue(line, valueType);
                            hasNextItem = true;
                            prefixSeen = false; 
                            return true;
                        } catch (Exception parseEx) {
                            continue;
                        }
                    }
                }

                endOfStream = true;
                return false;

            } catch (Exception e) {
                System.err.println("Failed to parse SSE stream: " + e.getMessage());
                endOfStream = true;
                return false;
            }
        }
    }
}
