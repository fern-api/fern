# frozen_string_literal: true

module FernErrors
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernErrors::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_errors/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernErrors::Simple::Client]
    def simple
      @simple ||= FernErrors::Simple::Client.new(client: @raw_client)
    end
  end
end
