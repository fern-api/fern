# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_inferred-auth-implicit-reference/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::Auth::Client]
    def auth
      @auth ||= Seed::Auth::Client.new(client: @raw_client)
    end

    # @return [Seed::NestedNoAuthAPI::Client]
    def nested_no_auth_api
      @nested_no_auth_api ||= Seed::NestedNoAuthAPI::Client.new(client: @raw_client)
    end

    # @return [Seed::NestedAPI::Client]
    def nested_api
      @nested_api ||= Seed::NestedAPI::Client.new(client: @raw_client)
    end

    # @return [Seed::Simple::Client]
    def simple
      @simple ||= Seed::Simple::Client.new(client: @raw_client)
    end
  end
end
