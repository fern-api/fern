# frozen_string_literal: true

module FernBytesUpload
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernBytesUpload::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_bytes-upload/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernBytesUpload::Service::Client]
    def service
      @service ||= FernBytesUpload::Service::Client.new(client: @raw_client)
    end
  end
end
