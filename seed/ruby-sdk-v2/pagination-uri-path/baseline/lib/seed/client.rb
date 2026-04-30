# frozen_string_literal: true

module Seed
  class Client
    # @param request_options [Hash]
    # @param params [Seed::Types::InlinedChildRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def extended_inline_request_body(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "/extends/extended-inline-request-body",
        body: Seed::Types::InlinedChildRequest.new(params).to_h,
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
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_alias-extends/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end
  end
end
