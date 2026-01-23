# frozen_string_literal: true

module FernPublicObject
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernPublicObject::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_public-object/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernPublicObject::Service::Client]
    def service
      @service ||= FernPublicObject::Service::Client.new(client: @raw_client)
    end
  end
end
