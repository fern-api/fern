# frozen_string_literal: true

module Seed
  class Client
    # @param request_options [Hash]
    # @param params [Seed::Types::CreateRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [Seed::Types::Type]
    def create(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "/create",
        body: Seed::Types::CreateRequest.new(params).to_h,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::Type.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # @param request_options [Hash]
    # @param params [Hash]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    # @option params [Integer] :decimal
    # @option params [Integer] :even
    # @option params [String] :name
    #
    # @return [Seed::Types::Type]
    def get(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      query_params = {}
      query_params["decimal"] = params[:decimal] if params.key?(:decimal)
      query_params["even"] = params[:even] if params.key?(:even)
      query_params["name"] = params[:name] if params.key?(:name)

      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "GET",
        path: "",
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
        Seed::Types::Type.load(response.body)
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
          "User-Agent" => "fern_validation/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end
  end
end
