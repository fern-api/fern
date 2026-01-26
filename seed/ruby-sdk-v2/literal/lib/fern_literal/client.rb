# frozen_string_literal: true

module FernLiteral
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernLiteral::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_literal/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernLiteral::Headers::Client]
    def headers
      @headers ||= FernLiteral::Headers::Client.new(client: @raw_client)
    end

    # @return [FernLiteral::Inlined::Client]
    def inlined
      @inlined ||= FernLiteral::Inlined::Client.new(client: @raw_client)
    end

    # @return [FernLiteral::Path::Client]
    def path
      @path ||= FernLiteral::Path::Client.new(client: @raw_client)
    end

    # @return [FernLiteral::Query::Client]
    def query
      @query ||= FernLiteral::Query::Client.new(client: @raw_client)
    end

    # @return [FernLiteral::Reference::Client]
    def reference
      @reference ||= FernLiteral::Reference::Client.new(client: @raw_client)
    end
  end
end
