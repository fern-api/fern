# frozen_string_literal: true

module FernApiWideBasePath
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernApiWideBasePath::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_api-wide-base-path/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernApiWideBasePath::Service::Client]
    def service
      @service ||= FernApiWideBasePath::Service::Client.new(client: @raw_client)
    end
  end
end
