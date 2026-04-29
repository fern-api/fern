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
    # @option params [String, nil] :optional_baz
    # @option params [String, nil] :optional_nullable_baz
    # @option params [String] :required_baz
    # @option params [String, nil] :required_nullable_baz
    #
    # @return [Seed::Types::Foo]
    def get_foo(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      query_params = {}
      query_params["optional_baz"] = params[:optional_baz] if params.key?(:optional_baz)
      query_params["optional_nullable_baz"] = params[:optional_nullable_baz] if params.key?(:optional_nullable_baz)
      query_params["required_baz"] = params[:required_baz] if params.key?(:required_baz)
      query_params["required_nullable_baz"] = params[:required_nullable_baz] if params.key?(:required_nullable_baz)

      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "GET",
        path: "foo",
        query: query_params,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::Foo.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # @param request_options [Hash]
    # @param params [Seed::Types::UpdateFooRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    # @option params [String] :id
    # @option params [String] :x_idempotency_key
    #
    # @return [Seed::Types::Foo]
    def update_foo(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request_data = Seed::Types::UpdateFooRequest.new(params).to_h
      non_body_param_names = %w[id X-Idempotency-Key]
      body = request_data.except(*non_body_param_names)

      headers = {}
      headers["X-Idempotency-Key"] = params[:x_idempotency_key] if params[:x_idempotency_key]

      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "PATCH",
        path: "foo/#{URI.encode_uri_component(params[:id].to_s)}",
        headers: headers,
        body: body,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::Foo.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_required-nullable/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end
  end
end
