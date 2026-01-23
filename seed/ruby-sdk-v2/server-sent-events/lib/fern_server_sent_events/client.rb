# frozen_string_literal: true

module FernServerSentEvents
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernServerSentEvents::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_server-sent-events/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernServerSentEvents::Completions::Client]
    def completions
      @completions ||= FernServerSentEvents::Completions::Client.new(client: @raw_client)
    end
  end
end
