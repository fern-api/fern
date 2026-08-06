# frozen_string_literal: true

module Seed
  class Client
    # @param request_options [Hash]
    # @param params [Seed::Types::IdentifierUpdate]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    # @option params [String] :profile_id
    # @option params [String] :id_type_path_param
    #
    # @example
    #   client.update_profile_identifier(
    #     profile_id: "profile_123",
    #     id_type_path_param: "email",
    #     id_type: "phone",
    #     old_value: "+13175556789",
    #     new_value: "+13175556798"
    #   )
    #
    # @return [Seed::Types::UpdateProfileIdentifierResponse]
    def update_profile_identifier(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request_data = Seed::Types::IdentifierUpdate.new(params).to_h
      non_body_param_names = %w[profileId idTypePathParam]
      body = request_data.except(*non_body_param_names)

      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "PATCH",
        path: "Profiles/#{URI.encode_uri_component(params[:profile_id].to_s)}/Identifiers/#{URI.encode_uri_component(params[:id_type_path_param].to_s)}",
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
        Seed::Types::UpdateProfileIdentifierResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # @param base_url [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(base_url: nil, max_retries: 2)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::DEFAULT,
        headers: {
          "User-Agent" => "fern_openapi-path-param-body-collision/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        max_retries: max_retries
      )
    end
  end
end
