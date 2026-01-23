# frozen_string_literal: true

module FernNullableOptional
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernNullableOptional::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_nullable-optional/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernNullableOptional::NullableOptional::Client]
    def nullable_optional
      @nullable_optional ||= FernNullableOptional::NullableOptional::Client.new(client: @raw_client)
    end
  end
end
