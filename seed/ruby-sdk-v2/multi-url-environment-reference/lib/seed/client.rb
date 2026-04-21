# frozen_string_literal: true

module Seed
  class Client
    # @param token [String]
    # @param base_url [String, nil]
    # @param environment [Hash[Symbol, String], nil]
    #
    # @return [void]
    def initialize(token:, base_url: nil, environment: Seed::Environment::PRODUCTION)
      @base_url = base_url
      @environment = environment

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || environment&.dig(:base),
        headers: {
          "User-Agent" => "fern_multi-url-environment-reference/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::Items::Client]
    def items
      @items ||= Seed::Items::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end

    # @return [Seed::Auth::Client]
    def auth
      @auth ||= Seed::Auth::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end

    # @return [Seed::Files::Client]
    def files
      @files ||= Seed::Files::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end
  end
end
