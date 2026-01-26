# frozen_string_literal: true

module FernPackageYml
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernPackageYml::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_package-yml/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernPackageYml::Service::Client]
    def service
      @service ||= FernPackageYml::Service::Client.new(client: @raw_client)
    end
  end
end
