# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param version [String]
    #
    # @return [void]
    def initialize(base_url:, version:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_version-no-default/0.0.1",
          "X-Fern-Language" => "Ruby",
          "X-API-Version" => version.to_s
        }
      )
    end

    # @return [Seed::User::Client]
    def user
      @user ||= Seed::User::Client.new(client: @raw_client)
    end
  end
end
