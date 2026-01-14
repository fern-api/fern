# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
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
    def inlined_requests
      @inlined_requests ||= Seed::InlinedRequests::Client.new(client: @raw_client)
    end

    # @return [Seed::NoAuth::Client]
    def no_auth
      @no_auth ||= Seed::NoAuth::Client.new(client: @raw_client)
    end

    # @return [Seed::NoReqBody::Client]
    def no_req_body
      @no_req_body ||= Seed::NoReqBody::Client.new(client: @raw_client)
    end

    # @return [Seed::ReqWithHeaders::Client]
    def req_with_headers
      @req_with_headers ||= Seed::ReqWithHeaders::Client.new(client: @raw_client)
    end
  end

  class AsyncClient
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = Seed::Internal::Http::AsyncRawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_exhaustive/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::Endpoints::AsyncClient]
    def endpoints
      @endpoints ||= Seed::Endpoints::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::InlinedRequests::AsyncClient]
    def inlined_requests
      @inlined_requests ||= Seed::InlinedRequests::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::NoAuth::AsyncClient]
    def no_auth
      @no_auth ||= Seed::NoAuth::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::NoReqBody::AsyncClient]
    def no_req_body
      @no_req_body ||= Seed::NoReqBody::AsyncClient.new(client: @raw_client)
    end

    # @return [Seed::ReqWithHeaders::AsyncClient]
    def req_with_headers
      @req_with_headers ||= Seed::ReqWithHeaders::AsyncClient.new(client: @raw_client)
    end
  end
end
