# frozen_string_literal: true

module FernStreaming
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernStreaming::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_streaming/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernStreaming::Dummy::Client]
    def dummy
      @dummy ||= FernStreaming::Dummy::Client.new(client: @raw_client)
    end
  end
end
