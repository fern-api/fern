

module Seed
  class Client
    # @param base_url [String, nil]
    # @param username [String]
    # @param password [String]
    #
    # @return [void]
    def initialize(base_url: nil, username:, password:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_basic-auth/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Basic #{Base64.strict_encode64(\"#{username}:#{password}\")}"
        }
      )
    end
    # @return [Seed::BasicAuth::Client]
    def basic_auth
      @basic_auth ||= Seed::BasicAuth::Client.new(client: @raw_client)
    end
  end
end
