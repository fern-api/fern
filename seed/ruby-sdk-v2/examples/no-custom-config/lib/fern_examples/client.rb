# frozen_string_literal: true

module FernExamples
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernExamples::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_examples/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernExamples::File::Client]
    def file
      @file ||= FernExamples::File::Client.new(client: @raw_client)
    end

    # @return [FernExamples::Health::Client]
    def health
      @health ||= FernExamples::Health::Client.new(client: @raw_client)
    end

    # @return [FernExamples::Service::Client]
    def service
      @service ||= FernExamples::Service::Client.new(client: @raw_client)
    end
  end
end
