# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_error-property/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::Propertybasederror::Client]
    def propertybasederror
      @propertybasederror ||= Seed::Propertybasederror::Client.new(client: @raw_client)
    end
  end
end
