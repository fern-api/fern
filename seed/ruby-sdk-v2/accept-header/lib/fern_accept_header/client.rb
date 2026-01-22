# frozen_string_literal: true

module FernAcceptHeader
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernAcceptHeader::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_accept-header/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernAcceptHeader::Service::Client]
    def service
      @service ||= FernAcceptHeader::Service::Client.new(client: @raw_client)
    end
  end
end
