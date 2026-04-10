# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param username [String]
    # @param password [String]
    #
    # @return [void]
    def initialize(username:, password:, base_url: nil)
      headers = {
        "User-Agent" => "fern_basic-auth/0.0.1",
        "X-Fern-Language" => "Ruby"
      }
      headers["Authorization"] = "Basic #{Base64.strict_encode64("#{username}:#{password}")}"
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: headers
      )
    end

    # @return [Seed::BasicAuth::Client]
    def basic_auth
      @basic_auth ||= Seed::BasicAuth::Client.new(client: @raw_client)
    end
  end
end
