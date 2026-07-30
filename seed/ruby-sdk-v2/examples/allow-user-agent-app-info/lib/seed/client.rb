# frozen_string_literal: true

module Seed
  class Client
    # @param request_options [Hash]
    # @param params [Hash]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @example
    #   client.echo(request: "Hello world!\\n\\nwith\\n\\tnewlines")
    #
    # @return [String]
    def echo(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "",
        body: params,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      return if code.between?(200, 299)

      error_class = Seed::Errors::ResponseError.subclass_for_code(code)
      raise error_class.new(response.body, code: code)
    end

    # @param request_options [Hash]
    # @param params [Seed::Types::Type]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @example
    #   client.echo(request: "primitive")
    #
    # @return [Seed::Types::Identifier]
    def create_type(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "",
        body: Seed::Types::Type.new(params).to_h,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::Identifier.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # @param token [String]
    # @param base_url [String, nil]
    # @param max_retries [Integer]
    # @param app_info [Hash[Symbol, String], nil]
    #
    # @return [void]
    def initialize(token:, base_url: nil, max_retries: 2, app_info: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => Seed::Internal::Http::RawClient.append_app_info("fern_examples/0.0.1", app_info),
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        },
        max_retries: max_retries
      )
    end

    # @return [Seed::File::Client]
    def file
      @file ||= Seed::File::Client.new(client: @raw_client)
    end

    # @return [Seed::Health::Client]
    def health
      @health ||= Seed::Health::Client.new(client: @raw_client)
    end

    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client)
    end
  end
end
