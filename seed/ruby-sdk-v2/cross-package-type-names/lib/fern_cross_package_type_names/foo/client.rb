# frozen_string_literal: true

module FernCrossPackageTypeNames
  module Foo
    class Client
      # @param client [FernCrossPackageTypeNames::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernCrossPackageTypeNames::Foo::Types::FindRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernCrossPackageTypeNames::Foo::Types::OptionalString] :optional_string
      #
      # @return [FernCrossPackageTypeNames::Foo::Types::ImportingType]
      def find(request_options: {}, **params)
        params = FernCrossPackageTypeNames::Internal::Types::Utils.normalize_keys(params)
        request_data = FernCrossPackageTypeNames::Foo::Types::FindRequest.new(params).to_h
        non_body_param_names = ["optionalString"]
        body = request_data.except(*non_body_param_names)

        query_param_names = %i[optional_string]
        query_params = {}
        query_params["optionalString"] = params[:optional_string] if params.key?(:optional_string)
        params.except(*query_param_names)

        request = FernCrossPackageTypeNames::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "",
          query: query_params,
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernCrossPackageTypeNames::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernCrossPackageTypeNames::Foo::Types::ImportingType.load(response.body)
        else
          error_class = FernCrossPackageTypeNames::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
