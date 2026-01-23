# frozen_string_literal: true

module FernResponseProperty
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernResponseProperty::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_response-property/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernResponseProperty::Service::Client]
    def service
      @service ||= FernResponseProperty::Service::Client.new(client: @raw_client)
    end
  end
end
