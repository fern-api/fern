# frozen_string_literal: true

module FernNoEnvironment
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernNoEnvironment::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_no-environment/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernNoEnvironment::Dummy::Client]
    def dummy
      @dummy ||= FernNoEnvironment::Dummy::Client.new(client: @raw_client)
    end
  end
end
