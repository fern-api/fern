# frozen_string_literal: true

module FernVariables
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernVariables::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_variables/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernVariables::Service::Client]
    def service
      @service ||= FernVariables::Service::Client.new(client: @raw_client)
    end
  end
end
