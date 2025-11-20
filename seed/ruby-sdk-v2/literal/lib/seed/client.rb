# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String | nil]
    #
    # @return [Seed::Client]
    def initialize(base_url:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_literal/0.0.1",
          "X-Fern-Language": "Ruby"
        }
      )
    end

    # @return [Seed::Headers::Client]
    def headers
      @headers ||= Seed::Headers::Client.new(client: @raw_client)
    end

    # @return [Seed::Inlined::Client]
    def inlined
      @inlined ||= Seed::Inlined::Client.new(client: @raw_client)
    end

    # @return [Seed::Path::Client]
    def path
      @path ||= Seed::Path::Client.new(client: @raw_client)
    end

    # @return [Seed::Query::Client]
    def query
      @query ||= Seed::Query::Client.new(client: @raw_client)
    end

    # @return [Seed::Reference::Client]
    def reference
      @reference ||= Seed::Reference::Client.new(client: @raw_client)
    end
  end
end
