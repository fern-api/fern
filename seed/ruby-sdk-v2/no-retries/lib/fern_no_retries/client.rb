# frozen_string_literal: true

module FernNoRetries
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernNoRetries::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_no-retries/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernNoRetries::Retries::Client]
    def retries
      @retries ||= FernNoRetries::Retries::Client.new(client: @raw_client)
    end
  end
end
