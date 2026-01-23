# frozen_string_literal: true

module FernBearerTokenEnvironmentVariable
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(base_url: nil, token: ENV.fetch("COURIER_API_KEY", nil))
      @raw_client = FernBearerTokenEnvironmentVariable::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_bearer-token-environment-variable/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernBearerTokenEnvironmentVariable::Service::Client]
    def service
      @service ||= FernBearerTokenEnvironmentVariable::Service::Client.new(client: @raw_client)
    end
  end
end
