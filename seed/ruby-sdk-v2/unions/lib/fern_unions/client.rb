# frozen_string_literal: true

module FernUnions
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernUnions::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_unions/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernUnions::Bigunion::Client]
    def bigunion
      @bigunion ||= FernUnions::Bigunion::Client.new(client: @raw_client)
    end

    # @return [FernUnions::Union::Client]
    def union
      @union ||= FernUnions::Union::Client.new(client: @raw_client)
    end
  end
end
