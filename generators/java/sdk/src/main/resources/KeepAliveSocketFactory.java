import java.io.IOException;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.net.Socket;
import javax.net.SocketFactory;

/**
 * A {@link SocketFactory} that enables TCP keepalive on every socket it creates, so that long,
 * non-streaming requests survive idle-connection reaping by a firewall, load balancer, or NAT.
 *
 * <p>{@code SO_KEEPALIVE} is portable across platforms and is always applied. The finer-grained
 * idle/interval/count knobs live in {@code jdk.net.ExtendedSocketOptions} (JDK 11+) and are only
 * available on some platforms (e.g. Linux/macOS), so they are applied best-effort via reflection
 * and silently skipped where unavailable — mirroring the "emit what the platform supports"
 * approach. Reflection also keeps this class compilable at Java 8 source level.
 */
public final class KeepAliveSocketFactory extends SocketFactory {

    private final SocketFactory delegate;
    private final int idleSeconds;
    private final int intervalSeconds;
    private final int count;

    public KeepAliveSocketFactory(int idleSeconds, int intervalSeconds, int count) {
        this(SocketFactory.getDefault(), idleSeconds, intervalSeconds, count);
    }

    public KeepAliveSocketFactory(SocketFactory delegate, int idleSeconds, int intervalSeconds, int count) {
        this.delegate = delegate;
        this.idleSeconds = idleSeconds;
        this.intervalSeconds = intervalSeconds;
        this.count = count;
    }

    @Override
    public Socket createSocket() throws IOException {
        // OkHttp creates its connection sockets via the no-arg factory method and connects them
        // itself, so this is the variant that matters in practice.
        return configure(new Socket());
    }

    @Override
    public Socket createSocket(String host, int port) throws IOException {
        return configure(delegate.createSocket(host, port));
    }

    @Override
    public Socket createSocket(String host, int port, InetAddress localHost, int localPort) throws IOException {
        return configure(delegate.createSocket(host, port, localHost, localPort));
    }

    @Override
    public Socket createSocket(InetAddress host, int port) throws IOException {
        return configure(delegate.createSocket(host, port));
    }

    @Override
    public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort)
            throws IOException {
        return configure(delegate.createSocket(address, port, localAddress, localPort));
    }

    private Socket configure(Socket socket) throws IOException {
        socket.setKeepAlive(true);
        applyExtendedOption("TCP_KEEPIDLE", idleSeconds, socket);
        applyExtendedOption("TCP_KEEPINTERVAL", intervalSeconds, socket);
        applyExtendedOption("TCP_KEEPCOUNT", count, socket);
        return socket;
    }

    /**
     * Best-effort application of a {@code jdk.net.ExtendedSocketOptions} keepalive knob via
     * reflection. No-ops on JDKs/platforms where the option (or {@code Socket.setOption}) is
     * unavailable; {@code SO_KEEPALIVE} — already enabled by the caller — still applies with the
     * operating system's default idle interval in that case.
     */
    private static void applyExtendedOption(String optionName, int value, Socket socket) {
        try {
            Class<?> extendedOptions = Class.forName("jdk.net.ExtendedSocketOptions");
            Object option = extendedOptions.getField(optionName).get(null);
            Class<?> socketOptionClass = Class.forName("java.net.SocketOption");
            Method setOption = Socket.class.getMethod("setOption", socketOptionClass, Object.class);
            setOption.invoke(socket, option, value);
        } catch (ReflectiveOperationException | RuntimeException e) {
            // Extended keepalive knobs are unavailable on this JDK/platform (they require JDK 11+
            // and typically Linux/macOS), or setOption rejected the option. SO_KEEPALIVE remains
            // enabled, so we intentionally swallow this and fall back to the OS default idle.
        }
    }
}
