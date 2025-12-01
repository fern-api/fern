# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def post(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:maybe_string]
          body.add(
            name: "maybe_string",
            value: params[:maybe_string]
          )
        end
        if params[:integer]
          body.add(
            name: "integer",
            value: params[:integer]
          )
        end
        body.add_part(params[:file].to_form_data_part(name: "file")) if params[:file]
        body.add_part(params[:file_list].to_form_data_part(name: "file_list")) if params[:file_list]
        body.add_part(params[:maybe_file].to_form_data_part(name: "maybe_file")) if params[:maybe_file]
        body.add_part(params[:maybe_file_list].to_form_data_part(name: "maybe_file_list")) if params[:maybe_file_list]
        if params[:maybe_integer]
          body.add(
            name: "maybe_integer",
            value: params[:maybe_integer]
          )
        end
        if params[:optional_list_of_strings]
          body.add(
            name: "optional_list_of_strings",
            value: params[:optional_list_of_strings]
          )
        end
        if params[:list_of_objects]
          body.add(
            name: "list_of_objects",
            value: params[:list_of_objects]
          )
        end
        if params[:optional_metadata]
          body.add(
            name: "optional_metadata",
            value: params[:optional_metadata]
          )
        end
        if params[:optional_object_type]
          body.add(
            name: "optional_object_type",
            value: params[:optional_object_type]
          )
        end
        if params[:optional_id]
          body.add(
            name: "optional_id",
            value: params[:optional_id]
          )
        end
        if params[:alias_object]
          body.add(
            name: "alias_object",
            value: params[:alias_object]
          )
        end
        if params[:list_of_alias_object]
          body.add(
            name: "list_of_alias_object",
            value: params[:list_of_alias_object]
          )
        end
        if params[:alias_list_of_object]
          body.add(
            name: "alias_list_of_object",
            value: params[:alias_list_of_object]
          )
        end

        _request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "",
          body: body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def just_file(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        body.add_part(params[:file].to_form_data_part(name: "file")) if params[:file]

        _request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/just-file",
          body: body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String, nil] :maybe_string
      # @option params [Integer] :integer
      # @option params [Integer, nil] :maybe_integer
      # @option params [String] :list_of_strings
      # @option params [String, nil] :optional_list_of_strings
      #
      # @return [untyped]
      def just_file_with_query_params(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        body.add_part(params[:file].to_form_data_part(name: "file")) if params[:file]

        _request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/just-file-with-query-params",
          body: body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def with_content_type(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        body.add_part(params[:file].to_form_data_part(name: "file")) if params[:file]
        if params[:foo]
          body.add(
            name: "foo",
            value: params[:foo]
          )
        end
        if params[:bar]
          body.add(
            name: "bar",
            value: JSON.generate(Seed::Service::Types::MyObject.new(params[:bar]).to_h),
            content_type: "application/json"
          )
        end
        if params[:foo_bar]
          body.add(
            name: "foo_bar",
            value: JSON.generate(params[:foo_bar]),
            content_type: "application/json"
          )
        end

        _request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/with-content-type",
          body: body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def with_form_encoding(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        body.add_part(params[:file].to_form_data_part(name: "file")) if params[:file]
        if params[:foo]
          body.add(
            name: "foo",
            value:
          )
        end
        if params[:bar]
          body.add(
            name: "bar",
            value:
          )
        end

        _request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/with-form-encoding",
          body: body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def with_form_encoded_containers(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:maybe_string]
          body.add(
            name: "maybe_string",
            value:
          )
        end
        if params[:integer]
          body.add(
            name: "integer",
            value:
          )
        end
        body.add_part(params[:file].to_form_data_part(name: "file")) if params[:file]
        body.add_part(params[:file_list].to_form_data_part(name: "file_list")) if params[:file_list]
        body.add_part(params[:maybe_file].to_form_data_part(name: "maybe_file")) if params[:maybe_file]
        body.add_part(params[:maybe_file_list].to_form_data_part(name: "maybe_file_list")) if params[:maybe_file_list]
        if params[:maybe_integer]
          body.add(
            name: "maybe_integer",
            value:
          )
        end
        if params[:optional_list_of_strings]
          body.add(
            name: "optional_list_of_strings",
            value:
          )
        end
        if params[:list_of_objects]
          body.add(
            name: "list_of_objects",
            value:
          )
        end
        if params[:optional_metadata]
          body.add(
            name: "optional_metadata",
            value:
          )
        end
        if params[:optional_object_type]
          body.add(
            name: "optional_object_type",
            value:
          )
        end
        if params[:optional_id]
          body.add(
            name: "optional_id",
            value:
          )
        end
        if params[:list_of_objects_with_optionals]
          body.add(
            name: "list_of_objects_with_optionals",
            value:
          )
        end
        if params[:alias_object]
          body.add(
            name: "alias_object",
            value:
          )
        end
        if params[:list_of_alias_object]
          body.add(
            name: "list_of_alias_object",
            value:
          )
        end
        if params[:alias_list_of_object]
          body.add(
            name: "alias_list_of_object",
            value:
          )
        end

        _request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "",
          body: body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def optional_args(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        body.add_part(params[:image_file].to_form_data_part(name: "image_file")) if params[:image_file]
        if params[:request]
          body.add(
            name: "request",
            value: JSON.generate(params[:request]),
            content_type: "application/json; charset=utf-8"
          )
        end

        _request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/optional-args",
          body: body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def with_inline_type(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        body.add_part(params[:file].to_form_data_part(name: "file")) if params[:file]
        if params[:request]
          body.add(
            name: "request",
            value: params[:request]
          )
        end

        _request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/inline-type",
          body: body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def simple(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/snippet"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end
    end
  end
end
