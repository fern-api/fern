# frozen_string_literal: true

module FernContentType
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernContentType::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_content-type/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernContentType::Service::Client]
    def service
      @service ||= FernContentType::Service::Client.new(client: @raw_client)
    end
  end
end
