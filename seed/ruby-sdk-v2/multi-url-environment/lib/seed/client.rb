# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param environment [Hash[Symbol, String], nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil, environment: Seed::Environment::PRODUCTION)
      @base_url = base_url
      @environment = environment

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || environment&.dig(:ec_2),
        headers: {
          "User-Agent" => "fern_multi-url-environment/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::Ec2::Client]
    def ec_2
      @ec_2 ||= Seed::Ec2::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end

    # @return [Seed::S3::Client]
    def s_3
      @s_3 ||= Seed::S3::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end
  end

  class AsyncClient
    # @param base_url [String, nil]
    # @param environment [Hash[Symbol, String], nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil, environment: Seed::Environment::PRODUCTION)
      @base_url = base_url
      @environment = environment

      @raw_client = Seed::Internal::Http::AsyncRawClient.new(
        base_url: base_url || environment&.dig(:ec_2),
        headers: {
          "User-Agent" => "fern_multi-url-environment/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::Ec2::AsyncClient]
    def ec_2
      @ec_2 ||= Seed::Ec2::AsyncClient.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end

    # @return [Seed::S3::AsyncClient]
    def s_3
      @s_3 ||= Seed::S3::AsyncClient.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end
  end
end
