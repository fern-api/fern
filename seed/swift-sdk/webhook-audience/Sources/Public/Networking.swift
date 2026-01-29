import Foundation

#if canImport(FoundationNetworking)
    import FoundationNetworking
#endif

public enum Networking {
    #if canImport(FoundationNetworking)
        public typealias URLSession = FoundationNetworking.URLSession
        public typealias URLSessionConfiguration = FoundationNetworking.URLSessionConfiguration
        public typealias URLProtocol = FoundationNetworking.URLProtocol
        public typealias URLRequest = FoundationNetworking.URLRequest
        public typealias HTTPURLResponse = FoundationNetworking.HTTPURLResponse
    #else
        public typealias URLSession = Foundation.URLSession
        public typealias URLSessionConfiguration = Foundation.URLSessionConfiguration
        public typealias URLProtocol = Foundation.URLProtocol
        public typealias URLRequest = Foundation.URLRequest
        public typealias HTTPURLResponse = Foundation.HTTPURLResponse
    #endif
}
