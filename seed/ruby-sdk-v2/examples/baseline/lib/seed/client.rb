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
    # @option params [String] :region
    # @option params [String, nil] :limit
    #
    # @return [Seed::Types::TestGetResponse]
    def test_get(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      query_params = {}
      query_params["limit"] = params.fetch(:limit, "100")

      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "GET",
        path: "test/#{URI.encode_uri_component(params.fetch(:region, "us-east-1").to_s)}/resource",
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
        Seed::Types::TestGetResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # @param base_url [String, nil]
    # @param api_version [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil, api_version: "2024-02-08")
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_x-fern-default/0.0.1",
          "X-Fern-Language" => "Ruby",
          "X-API-Version" => api_version.to_s
        }
      )
    end
  end
end
