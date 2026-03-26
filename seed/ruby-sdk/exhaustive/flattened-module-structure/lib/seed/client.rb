

module Seed
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(base_url: nil, token:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_exhaustive/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end
    # @return [Seed::Endpoints::Client]
    def endpoints
      @endpoints ||= Seed::Endpoints::Client.new(client: @raw_client)
    end
    # @return [Seed::InlinedRequests::Client]
    def inlined-requests
      @inlined-requests ||= Seed::InlinedRequests::Client.new(client: @raw_client)
    end
    # @return [Seed::NoAuth::Client]
    def no-auth
      @no-auth ||= Seed::NoAuth::Client.new(client: @raw_client)
    end
    # @return [Seed::NoReqBody::Client]
    def no-req-body
      @no-req-body ||= Seed::NoReqBody::Client.new(client: @raw_client)
    end
    # @return [Seed::ReqWithHeaders::Client]
    def req-with-headers
      @req-with-headers ||= Seed::ReqWithHeaders::Client.new(client: @raw_client)
    end
  end
end
