# frozen_string_literal: true

module FernErrorProperty
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernErrorProperty::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_error-property/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernErrorProperty::PropertyBasedError::Client]
    def property_based_error
      @property_based_error ||= FernErrorProperty::PropertyBasedError::Client.new(client: @raw_client)
    end
  end
end
