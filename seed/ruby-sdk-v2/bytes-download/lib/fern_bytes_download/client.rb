# frozen_string_literal: true

module FernBytesDownload
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernBytesDownload::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_bytes-download/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernBytesDownload::Service::Client]
    def service
      @service ||= FernBytesDownload::Service::Client.new(client: @raw_client)
    end
  end
end
