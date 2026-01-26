# frozen_string_literal: true

module FernUndiscriminatedUnions
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernUndiscriminatedUnions::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_undiscriminated-unions/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernUndiscriminatedUnions::Union::Client]
    def union
      @union ||= FernUndiscriminatedUnions::Union::Client.new(client: @raw_client)
    end
  end
end
