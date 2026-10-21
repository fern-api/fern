# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param root_variable [String, nil]
    # @param max_retries [Integer]
    # @param timeout [Numeric]
    #
    # @return [void]
    def initialize(base_url: nil, root_variable: ENV.fetch("ROOT_VARIABLE", nil), max_retries: 2, timeout: 60)
      @root_variable = root_variable

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_variables/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        max_retries: max_retries,
        timeout: timeout
      )
    end

    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client, root_variable: @root_variable)
    end
  end
end
