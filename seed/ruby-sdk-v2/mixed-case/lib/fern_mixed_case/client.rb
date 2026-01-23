# frozen_string_literal: true

module FernMixedCase
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernMixedCase::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_mixed-case/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernMixedCase::Service::Client]
    def service
      @service ||= FernMixedCase::Service::Client.new(client: @raw_client)
    end
  end
end
