# frozen_string_literal: true

module FernMultiUrlEnvironment
  class Client
    # @param base_url [String, nil]
    # @param environment [Hash[Symbol, String], nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil, environment: FernMultiUrlEnvironment::Environment::PRODUCTION)
      @base_url = base_url
      @environment = environment

      @raw_client = FernMultiUrlEnvironment::Internal::Http::RawClient.new(
        base_url: base_url || environment&.dig(:ec_2),
        headers: {
          "User-Agent" => "fern_multi-url-environment/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernMultiUrlEnvironment::Ec2::Client]
    def ec_2
      @ec_2 ||= FernMultiUrlEnvironment::Ec2::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end

    # @return [FernMultiUrlEnvironment::S3::Client]
    def s_3
      @s_3 ||= FernMultiUrlEnvironment::S3::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end
  end
end
