# frozen_string_literal: true

module FernOptional
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernOptional::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_optional/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernOptional::Optional::Client]
    def optional
      @optional ||= FernOptional::Optional::Client.new(client: @raw_client)
    end
  end
end
