# frozen_string_literal: true

module Seed
  class Client
    # Returns a RootObject which inherits from a nullable schema.
    #
    # @param request_options [Hash]
    # @param _params [Hash]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [Seed::Types::RootObject]
    def get_test(request_options: {}, **_params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "GET",
        path: "test",
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::RootObject.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # Creates a test object with nullable allOf in request body.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::RootObject]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [Seed::Types::RootObject]
    def create_test(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "test",
        body: Seed::Types::RootObject.new(params).to_h,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::RootObject.load(response.body)
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
        base_url: base_url || Seed::Environment::DEFAULT,
        headers: {
          "User-Agent" => "fern_nullable-allof-extends/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end
  end
end
