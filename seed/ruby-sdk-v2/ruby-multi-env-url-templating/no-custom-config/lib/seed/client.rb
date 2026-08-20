# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param environment [Hash[::Symbol, String], nil]
    # @param region [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(base_url: nil, environment: ::Seed::Environment::PRODUCTION, region: nil, max_retries: 2)
      unless region.nil?
        region_value = region.nil? ? "us1" : region
        environment_url_templates = {
          ::Seed::Environment::PRODUCTION => {
            acme: "https://api.#{region_value}.acme.com",
            oauth: "https://oauth.#{region_value}.acme.com"
          },
          ::Seed::Environment::STAGING => {
            acme: "https://api.stage.#{region_value}.acme.com",
            oauth: "https://oauth.stage.#{region_value}.acme.com"
          },
          ::Seed::Environment::DEVELOPMENT => {
            acme: "https://api.dev.#{region_value}.acme.com",
            oauth: "https://oauth.dev.#{region_value}.acme.com"
          }
        }
        environment = environment_url_templates.fetch(environment, environment)
        environment ||= {
          acme: "https://api.#{region_value}.acme.com",
          oauth: "https://oauth.#{region_value}.acme.com"
        }
      end

      @base_url = base_url
      @environment = environment

      @raw_client = ::Seed::Internal::Http::RawClient.new(
        base_url: base_url || environment&.dig(:acme),
        headers: {
          "User-Agent" => "fern_ruby-multi-env-url-templating/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        max_retries: max_retries
      )
    end

    # @return [::Seed::Auth::Client]
    def auth
      @auth ||= ::Seed::Auth::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end

    # @return [::Seed::Core::Client]
    def core
      @core ||= ::Seed::Core::Client.new(client: @raw_client, base_url: @base_url, environment: @environment)
    end
  end
end
