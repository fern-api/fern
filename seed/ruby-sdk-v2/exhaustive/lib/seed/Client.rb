# frozen_string_literal: true

module Seed
  class Client
    # @return [Seed::Client]
    def initialize(base_url:, token:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_exhaustive/0.0.1",
          "X-Fern-Language": "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::Endpoints::Client]
    def endpoints
      @endpoints ||= Seed::Endpoints::Client.new(client: @raw_client)
    end

    # @return [Seed::InlinedRequests::Client]
    def inlinedRequests
      @inlinedRequests ||= Seed::InlinedRequests::Client.new(client: @raw_client)
    end

    # @return [Seed::NoAuth::Client]
    def noAuth
      @noAuth ||= Seed::NoAuth::Client.new(client: @raw_client)
    end

    # @return [Seed::NoReqBody::Client]
    def noReqBody
      @noReqBody ||= Seed::NoReqBody::Client.new(client: @raw_client)
    end

    # @return [Seed::ReqWithHeaders::Client]
    def reqWithHeaders
      @reqWithHeaders ||= Seed::ReqWithHeaders::Client.new(client: @raw_client)
    end
  end
end
