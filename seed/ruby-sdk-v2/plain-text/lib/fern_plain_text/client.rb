# frozen_string_literal: true

module FernPlainText
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernPlainText::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_plain-text/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernPlainText::Service::Client]
    def service
      @service ||= FernPlainText::Service::Client.new(client: @raw_client)
    end
  end
end
