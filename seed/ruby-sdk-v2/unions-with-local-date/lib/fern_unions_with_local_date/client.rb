# frozen_string_literal: true

module FernUnionsWithLocalDate
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernUnionsWithLocalDate::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_unions-with-local-date/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernUnionsWithLocalDate::Bigunion::Client]
    def bigunion
      @bigunion ||= FernUnionsWithLocalDate::Bigunion::Client.new(client: @raw_client)
    end

    # @return [FernUnionsWithLocalDate::Types::Client]
    def types
      @types ||= FernUnionsWithLocalDate::Types::Client.new(client: @raw_client)
    end

    # @return [FernUnionsWithLocalDate::Union::Client]
    def union
      @union ||= FernUnionsWithLocalDate::Union::Client.new(client: @raw_client)
    end
  end
end
