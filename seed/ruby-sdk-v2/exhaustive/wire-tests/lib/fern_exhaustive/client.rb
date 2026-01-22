# frozen_string_literal: true

module FernExhaustive
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernExhaustive::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_exhaustive/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernExhaustive::Endpoints::Client]
    def endpoints
      @endpoints ||= FernExhaustive::Endpoints::Client.new(client: @raw_client)
    end

    # @return [FernExhaustive::InlinedRequests::Client]
    def inlined_requests
      @inlined_requests ||= FernExhaustive::InlinedRequests::Client.new(client: @raw_client)
    end

    # @return [FernExhaustive::NoAuth::Client]
    def no_auth
      @no_auth ||= FernExhaustive::NoAuth::Client.new(client: @raw_client)
    end

    # @return [FernExhaustive::NoReqBody::Client]
    def no_req_body
      @no_req_body ||= FernExhaustive::NoReqBody::Client.new(client: @raw_client)
    end

    # @return [FernExhaustive::ReqWithHeaders::Client]
    def req_with_headers
      @req_with_headers ||= FernExhaustive::ReqWithHeaders::Client.new(client: @raw_client)
    end
  end
end
