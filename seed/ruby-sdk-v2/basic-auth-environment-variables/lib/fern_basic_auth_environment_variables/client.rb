# frozen_string_literal: true

module FernBasicAuthEnvironmentVariables
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernBasicAuthEnvironmentVariables::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_basic-auth-environment-variables/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernBasicAuthEnvironmentVariables::BasicAuth::Client]
    def basic_auth
      @basic_auth ||= FernBasicAuthEnvironmentVariables::BasicAuth::Client.new(client: @raw_client)
    end
  end
end
