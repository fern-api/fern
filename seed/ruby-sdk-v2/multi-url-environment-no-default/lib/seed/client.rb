# frozen_string_literal: true

module Seed
  class Client
    # @param token [String]
    # @param base_url [String, nil]
    # @param environment [Hash[Symbol, String], nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(token:, base_url: nil, environment: nil, max_retries: 2)
      @base_url = base_url
      @environment = environment

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || environment&.dig(:ec2),
        headers: {
          "User-Agent" => "fern_multi-url-environment-no-default/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        },
        max_retries: max_retries
      )
    end

    # @return [Seed::Ec2::Client]
    def ec2
      @ec2 ||= Seed::Ec2::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end

    # @return [Seed::S3::Client]
    def s3
      @s3 ||= Seed::S3::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end
  end
end
