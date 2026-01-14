# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_simple-api/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::User::Client]
    def user
      @user ||= Seed::User::Client.new(client: @raw_client)
    end
  end

  class AsyncClient
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = Seed::Internal::Http::AsyncRawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_simple-api/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::User::AsyncClient]
    def user
      @user ||= Seed::User::AsyncClient.new(client: @raw_client)
    end
  end
end
