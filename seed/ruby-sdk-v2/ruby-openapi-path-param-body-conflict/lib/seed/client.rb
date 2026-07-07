# frozen_string_literal: true

module Seed
  class Client
    # @param username [String]
    # @param password [String]
    # @param base_url [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(username:, password:, base_url: nil, max_retries: 2)
      headers = {
        "User-Agent" => "fern_ruby-openapi-path-param-body-conflict/0.0.1",
        "X-Fern-Language" => "Ruby"
      }
      headers["Authorization"] = "Basic #{Base64.strict_encode64("#{username}:#{password}")}"
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: headers,
        max_retries: max_retries
      )
    end

    # @return [Seed::Identifiers::Client]
    def identifiers
      @identifiers ||= Seed::Identifiers::Client.new(client: @raw_client)
    end
  end
end
