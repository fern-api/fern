# frozen_string_literal: true

module FernRubyReservedWordProperties
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernRubyReservedWordProperties::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_ruby-reserved-word-properties/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernRubyReservedWordProperties::Service::Client]
    def service
      @service ||= FernRubyReservedWordProperties::Service::Client.new(client: @raw_client)
    end
  end
end
