# frozen_string_literal: true

module FernStreamingParameter
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernStreamingParameter::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_streaming-parameter/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernStreamingParameter::Dummy::Client]
    def dummy
      @dummy ||= FernStreamingParameter::Dummy::Client.new(client: @raw_client)
    end
  end
end
