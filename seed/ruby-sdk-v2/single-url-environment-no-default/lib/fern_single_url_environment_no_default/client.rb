# frozen_string_literal: true

module FernSingleUrlEnvironmentNoDefault
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernSingleUrlEnvironmentNoDefault::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_single-url-environment-no-default/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernSingleUrlEnvironmentNoDefault::Dummy::Client]
    def dummy
      @dummy ||= FernSingleUrlEnvironmentNoDefault::Dummy::Client.new(client: @raw_client)
    end
  end
end
