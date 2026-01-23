# frozen_string_literal: true

module FernSingleUrlEnvironmentDefault
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernSingleUrlEnvironmentDefault::Internal::Http::RawClient.new(
        base_url: base_url || FernSingleUrlEnvironmentDefault::Environment::PRODUCTION,
        headers: {
          "User-Agent" => "fern_single-url-environment-default/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernSingleUrlEnvironmentDefault::Dummy::Client]
    def dummy
      @dummy ||= FernSingleUrlEnvironmentDefault::Dummy::Client.new(client: @raw_client)
    end
  end
end
