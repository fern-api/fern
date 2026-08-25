# frozen_string_literal: true

module Seed
  class Client
    # @param request_options [Hash]
    # @param params [Seed::Types::EchoRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    # @option params [String] :id
    #
    # @example
    #   client.echo(
    #     id: "id-ksfd9c1",
    #     name: "Hello world!",
    #     size: 20
    #   )
    #
    # @return [String]
    def echo(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      path_param_names = %i[id]
      body_params = params.except(*path_param_names)

      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "/#{URI.encode_uri_component(params[:id].to_s)}/",
        body: Seed::Types::EchoRequest.new(body_params).to_h,
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

    # @param base_url [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(base_url: nil, max_retries: 2)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_package-yml/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        max_retries: max_retries
      )
    end

    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client)
    end
  end
end
