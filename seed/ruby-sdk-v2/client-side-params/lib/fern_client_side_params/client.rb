# frozen_string_literal: true

module FernClientSideParams
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernClientSideParams::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_client-side-params/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernClientSideParams::Service::Client]
    def service
      @service ||= FernClientSideParams::Service::Client.new(client: @raw_client)
    end
  end
end
