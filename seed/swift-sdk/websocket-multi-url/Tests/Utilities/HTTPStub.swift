import Api
import Foundation

final class HTTPStub {
    private static func buildURLSession(stubId: String, operationQueue: OperationQueue)
        -> Networking.URLSession
    {
        let config = buildURLSessionConfiguration(stubId: stubId)
        if let uuid = UUID(uuidString: stubId) {
            StubURLProtocol.register(queue: operationQueue, id: uuid)
        }
        return Networking.URLSession(configuration: config, delegate: nil, delegateQueue: operationQueue)
    }

    private static func buildURLSessionConfiguration(stubId: String) -> Networking.URLSessionConfiguration {
        let config = Networking.URLSessionConfiguration.ephemeral
        config.protocolClasses = [StubURLProtocol.self]
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        config.urlCache = nil
        config.httpAdditionalHeaders = ["Stub-ID": stubId]
        return config
    }

    private static func buildOperationQueue() -> OperationQueue {
        let queue = OperationQueue()
        queue.maxConcurrentOperationCount = 1
        queue.qualityOfService = .userInitiated
        return queue
    }

    private let session: Networking.URLSession
    private let delegateQueue: OperationQueue
    private let identifier: UUID

    init() {
        self.identifier = UUID()
        self.delegateQueue = Self.buildOperationQueue()
        self.session = Self.buildURLSession(
            stubId: identifier.uuidString, operationQueue: delegateQueue)
        #if !canImport(Darwin)
            // On Linux, URLProtocol doesn't get the additional headers at canInit time.
            // Track the active stub id so the protocol can resolve responses without headers.
            StubURLProtocol.setActiveStubId(identifier)
        #endif
    }

    var urlSession: Networking.URLSession {
        session
    }

    var headers: [String: String] {
        ["Stub-ID": identifier.uuidString]
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

    func setResponseSequence(
        _ responses: [(statusCode: Int, headers: [String: String], body: Data)]
    ) {
        StubURLProtocol.configureSequence(id: identifier, responses: responses)
    }

    func takeLastRequest() -> Networking.URLRequest? {
        StubURLProtocol.takeLastRequest(for: identifier)
    }

    func getRequestCount() -> Int {
        StubURLProtocol.getRequestCount(for: identifier)
    }

    deinit {
        StubURLProtocol.reset(id: identifier)
        StubURLProtocol.deregister(queue: delegateQueue)
        #if !canImport(Darwin)
            StubURLProtocol.clearActiveStubId(identifier)
        #endif
    }
}

private final class StubURLProtocol: Networking.URLProtocol {
    struct Response {
        let statusCode: Int
        let headers: [String: String]
        let body: Data
        var lastRequest: Networking.URLRequest?
    }

    struct ResponseSequence {
        var responses: [Response]
        var currentIndex: Int = 0
        var lastRequest: Networking.URLRequest?

        mutating func nextResponse() -> Response? {
            guard currentIndex < responses.count else { return nil }
            let response = responses[currentIndex]
            currentIndex += 1
            return response
        }
    }

    private static var responses: [UUID: Response] = [:]
    private static var responseSequences: [UUID: ResponseSequence] = [:]
    private static let lock = NSLock()
    private static var queueIdMap: [ObjectIdentifier: UUID] = [:]
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
        responseSequences[id] = nil
        lock.unlock()
    }

    static func configureSequence(
        id: UUID,
        responses: [(statusCode: Int, headers: [String: String], body: Data)]
    ) {
        lock.lock()
        let responseList = responses.map {
            Response(
                statusCode: $0.statusCode, headers: $0.headers, body: $0.body, lastRequest: nil)
        }
        responseSequences[id] = ResponseSequence(responses: responseList)
        StubURLProtocol.responses[id] = nil
        lock.unlock()
    }

    static func takeLastRequest(for id: UUID) -> Networking.URLRequest? {
        lock.lock()
        defer { lock.unlock() }

        if var sequence = responseSequences[id], let request = sequence.lastRequest {
            sequence.lastRequest = nil
            responseSequences[id] = sequence
            return request
        }

        guard var response = responses[id], let request = response.lastRequest else {
            return nil
        }
        response.lastRequest = nil
        responses[id] = response
        return request
    }

    static func getRequestCount(for id: UUID) -> Int {
        lock.lock()
        defer { lock.unlock() }

        if let sequence = responseSequences[id] {
            return sequence.currentIndex
        }

        return responses[id]?.lastRequest != nil ? 1 : 0
    }

    static func reset(id: UUID) {
        lock.lock()
        responses[id] = nil
        responseSequences[id] = nil
        lock.unlock()
    }

    static func register(queue: OperationQueue, id: UUID) {
        lock.lock()
        queueIdMap[ObjectIdentifier(queue)] = id
        lock.unlock()
    }

    static func deregister(queue: OperationQueue) {
        lock.lock()
        queueIdMap[ObjectIdentifier(queue)] = nil
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

    override class func canInit(with request: Networking.URLRequest) -> Bool {
        #if canImport(Darwin)
            return request.value(forHTTPHeaderField: "Stub-ID") != nil
        #else
            // On Linux, intercept all requests created by the session that installed this protocol.
            // We'll resolve the correct stub id during startLoading using the active id stack.
            return true
        #endif
    }

    override class func canonicalRequest(for request: Networking.URLRequest) -> Networking.URLRequest {
        request
    }

    override func startLoading() {
        guard let client else { return }
        #if canImport(Darwin)
            guard let idValue = request.value(forHTTPHeaderField: "Stub-ID"),
                let id = UUID(uuidString: idValue)
            else {
                client.urlProtocol(self, didFailWithError: URLError(.cannotFindHost))
                return
            }
        #else
            // Prefer the Stub-ID header if available on Linux; fall back to the active id stack.
            var resolvedId: UUID?
            if let idValue = request.value(forHTTPHeaderField: "Stub-ID"),
                let headerId = UUID(uuidString: idValue)
            {
                resolvedId = headerId
            } else {
                if let currentQueue = OperationQueue.current {
                    StubURLProtocol.lock.lock()
                    if let mapped = StubURLProtocol.queueIdMap[ObjectIdentifier(currentQueue)] {
                        resolvedId = mapped
                    }
                    StubURLProtocol.lock.unlock()
                }
                StubURLProtocol.lock.lock()
                resolvedId = StubURLProtocol.activeStubIds.last
                StubURLProtocol.lock.unlock()
            }
            guard let id = resolvedId else {
                client.urlProtocol(self, didFailWithError: URLError(.unknown))
                return
            }
        #endif

        StubURLProtocol.lock.lock()

        if var sequence = StubURLProtocol.responseSequences[id] {
            guard let response = sequence.nextResponse() else {
                StubURLProtocol.lock.unlock()
                client.urlProtocol(self, didFailWithError: URLError(.unknown))
                return
            }
            sequence.lastRequest = request
            StubURLProtocol.responseSequences[id] = sequence
            StubURLProtocol.lock.unlock()

            guard let url = request.url else {
                client.urlProtocol(self, didFailWithError: URLError(.badURL))
                return
            }

            let httpResponse = Networking.HTTPURLResponse(
                url: url,
                statusCode: response.statusCode,
                httpVersion: "HTTP/1.1",
                headerFields: response.headers
            )!

            client.urlProtocol(self, didReceive: httpResponse, cacheStoragePolicy: .notAllowed)
            client.urlProtocol(self, didLoad: response.body)
            client.urlProtocolDidFinishLoading(self)
            return
        }

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

        let httpResponse = Networking.HTTPURLResponse(
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
