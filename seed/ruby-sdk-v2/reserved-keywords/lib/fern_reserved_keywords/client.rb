# frozen_string_literal: true

module FernReservedKeywords
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernReservedKeywords::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_reserved-keywords/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernReservedKeywords::Package::Client]
    def package
      @package ||= FernReservedKeywords::Package::Client.new(client: @raw_client)
    end
  end
end
