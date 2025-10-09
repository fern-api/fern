import Foundation

final class WireStub {
    private static func buildURLSession(wireStubId: String) -> URLSession {
        let config = buildURLSessionConfiguration(wireStubId: wireStubId)
        let operationQueue = buildOperationQueue()
        return URLSession(configuration: config, delegate: nil, delegateQueue: operationQueue)
    }

    private static func buildURLSessionConfiguration(wireStubId: String) -> URLSessionConfiguration
    {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [StubURLProtocol.self]
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        config.urlCache = nil
        config.httpAdditionalHeaders = ["WireStub-ID": wireStubId]
        return config
    }

    private static func buildOperationQueue() -> OperationQueue {
        let queue = OperationQueue()
        queue.maxConcurrentOperationCount = 1
        queue.qualityOfService = .userInitiated
        return queue
    }

    private let session: URLSession
    private let identifier: UUID

    init() {
        self.identifier = UUID()
        self.session = Self.buildURLSession(wireStubId: identifier.uuidString)
        #if !canImport(Darwin)
            // On Linux, URLProtocol doesn't get the additional headers at canInit time.
            // Track the active stub id so the protocol can resolve responses without headers.
            StubURLProtocol.setActiveStubId(identifier)
        #endif
    }

    var urlSession: URLSession {
        session
    }

    func setResponse(
        statusCode: Int = 200,
        headers: [String: String] = ["Content-Type": "application/json"],
        body: Data
    ) {
        StubURLProtocol.configure(
            id: identifier,
            statusCode: statusCode,
            headers: headers,
            body: body
        )
    }

    func takeLastRequest() -> URLRequest? {
        StubURLProtocol.takeLastRequest(for: identifier)
    }

    deinit {
        StubURLProtocol.reset(id: identifier)
        #if !canImport(Darwin)
            StubURLProtocol.clearActiveStubId(identifier)
        #endif
    }
}

private final class StubURLProtocol: URLProtocol {
    struct Response {
        let statusCode: Int
        let headers: [String: String]
        let body: Data
        var lastRequest: URLRequest?
    }

    private static var responses: [UUID: Response] = [:]
    private static let lock = NSLock()
    #if !canImport(Darwin)
        // Fallback for Linux where request headers may not be visible in canInit.
        private static var activeStubIds: [UUID] = []
    #endif

    static func configure(
        id: UUID,
        statusCode: Int,
        headers: [String: String],
        body: Data
    ) {
        lock.lock()
        responses[id] = Response(
            statusCode: statusCode, headers: headers, body: body, lastRequest: nil)
        lock.unlock()
    }

    static func takeLastRequest(for id: UUID) -> URLRequest? {
        lock.lock()
        defer { lock.unlock() }
        guard var response = responses[id], let request = response.lastRequest else {
            return nil
        }
        response.lastRequest = nil
        responses[id] = response
        return request
    }

    static func reset(id: UUID) {
        lock.lock()
        responses[id] = nil
        lock.unlock()
    }

    #if !canImport(Darwin)
        static func setActiveStubId(_ id: UUID) {
            lock.lock()
            activeStubIds.append(id)
            lock.unlock()
        }

        static func clearActiveStubId(_ id: UUID) {
            lock.lock()
            if let idx = activeStubIds.lastIndex(of: id) {
                activeStubIds.remove(at: idx)
            }
            lock.unlock()
        }
    #endif

    override class func canInit(with request: URLRequest) -> Bool {
        #if canImport(Darwin)
            return request.value(forHTTPHeaderField: "WireStub-ID") != nil
        #else
            // On Linux, intercept all requests created by the session that installed this protocol.
            // We'll resolve the correct stub id during startLoading using the active id stack.
            return true
        #endif
    }

    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        request
    }

    override func startLoading() {
        guard let client else { return }
        #if canImport(Darwin)
            guard let idValue = request.value(forHTTPHeaderField: "WireStub-ID"),
                let id = UUID(uuidString: idValue)
            else {
                client.urlProtocol(self, didFailWithError: URLError(.cannotFindHost))
                return
            }
        #else
            // Use the most recent active stub id for this session on Linux.
            StubURLProtocol.lock.lock()
            let id = StubURLProtocol.activeStubIds.last
            StubURLProtocol.lock.unlock()
            guard let id else {
                client.urlProtocol(self, didFailWithError: URLError(.unknown))
                return
            }
        #endif

        StubURLProtocol.lock.lock()
        guard var response = StubURLProtocol.responses[id] else {
            StubURLProtocol.lock.unlock()
            client.urlProtocol(self, didFailWithError: URLError(.unknown))
            return
        }
        response.lastRequest = request
        StubURLProtocol.responses[id] = response
        StubURLProtocol.lock.unlock()

        guard let url = request.url else {
            client.urlProtocol(self, didFailWithError: URLError(.badURL))
            return
        }

        let httpResponse = HTTPURLResponse(
            url: url,
            statusCode: response.statusCode,
            httpVersion: "HTTP/1.1",
            headerFields: response.headers
        )!

        client.urlProtocol(self, didReceive: httpResponse, cacheStoragePolicy: .notAllowed)
        client.urlProtocol(self, didLoad: response.body)
        client.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}
