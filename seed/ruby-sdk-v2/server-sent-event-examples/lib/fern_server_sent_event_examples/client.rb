# frozen_string_literal: true

module FernServerSentEventExamples
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernServerSentEventExamples::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_server-sent-event-examples/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernServerSentEventExamples::Completions::Client]
    def completions
      @completions ||= FernServerSentEventExamples::Completions::Client.new(client: @raw_client)
    end
  end
end
