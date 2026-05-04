# frozen_string_literal: true

module Seed
  module Vendor
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::Types::UpdateVendorRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :vendor_id
      #
      # @return [Seed::Types::Vendor]
      def update_vendor(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        path_param_names = %i[vendor_id]
        body_params = params.except(*path_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PUT",
          path: "vendors/#{URI.encode_uri_component(params[:vendor_id].to_s)}",
          body: Seed::Types::UpdateVendorRequest.new(body_params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Vendor.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Seed::Vendor::Types::CreateVendorRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String, nil] :idempotency_key
      #
      # @return [Seed::Types::Vendor]
      def create_vendor(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Vendor::Types::CreateVendorRequest.new(params).to_h
        non_body_param_names = %w[idempotency_key]
        body = request_data.except(*non_body_param_names)

        headers = {}
        headers["idempotency_key"] = params[:idempotency_key] if params[:idempotency_key]

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "vendors",
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
          Seed::Types::Vendor.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
