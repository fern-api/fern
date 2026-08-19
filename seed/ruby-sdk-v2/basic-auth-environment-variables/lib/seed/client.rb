# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param username [String]
    # @param access_token [String]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(base_url: nil, username: ENV.fetch("USERNAME", nil), access_token: ENV.fetch("PASSWORD", nil), max_retries: 2)
      headers = {
        "User-Agent" => "fern_basic-auth-environment-variables/0.0.1",
        "X-Fern-Language" => "Ruby"
      }
      headers["Authorization"] = "Basic #{Base64.strict_encode64("#{username}:#{access_token}")}"
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: headers,
        max_retries: max_retries
      )
    end

    # @return [Seed::BasicAuth::Client]
    def basic_auth
      @basic_auth ||= Seed::BasicAuth::Client.new(client: @raw_client)
    end
  end
end
