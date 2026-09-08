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
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        unless params[:maybe_string].nil?
          body.add(
            name: "maybe_string",
            value: params[:maybe_string]
          )
        end
        unless params[:integer].nil?
          body.add(
            name: "integer",
            value: params[:integer]
          )
        end
        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file]
          )
        end
        params[:file_list]&.each do |file|
          body.add_file(
            name: "file_list",
            file: file
          )
        end
        if params[:maybe_file]
          body.add_file(
            name: "maybe_file",
            file: params[:maybe_file]
          )
        end
        params[:maybe_file_list]&.each do |file|
          body.add_file(
            name: "maybe_file_list",
            file: file
          )
        end
        unless params[:maybe_integer].nil?
          body.add(
            name: "maybe_integer",
            value: params[:maybe_integer]
          )
        end
        unless params[:optional_list_of_strings].nil?
          body.add(
            name: "optional_list_of_strings",
            value: params[:optional_list_of_strings]
          )
        end
        unless params[:list_of_objects].nil?
          body.add(
            name: "list_of_objects",
            value: params[:list_of_objects]
          )
        end
        unless params[:optional_metadata].nil?
          body.add(
            name: "optional_metadata",
            value: params[:optional_metadata]
          )
        end
        unless params[:optional_object_type].nil?
          body.add(
            name: "optional_object_type",
            value: params[:optional_object_type]
          )
        end
        unless params[:optional_id].nil?
          body.add(
            name: "optional_id",
            value: params[:optional_id]
          )
        end
        unless params[:alias_object].nil?
          body.add(
            name: "alias_object",
            value: params[:alias_object]
          )
        end
        unless params[:list_of_alias_object].nil?
          body.add(
            name: "list_of_alias_object",
            value: params[:list_of_alias_object]
          )
        end
        unless params[:alias_list_of_object].nil?
          body.add(
            name: "alias_list_of_object",
            value: params[:alias_list_of_object]
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "",
          body: body,
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

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.service.just_file
      #
      # @return [untyped]
      def just_file(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file]
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/just-file",
          body: body,
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
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file]
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/just-file-with-query-params",
          body: body,
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

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String, nil] :maybe_string
      # @option params [Integer, nil] :maybe_integer
      #
      # @return [untyped]
      def just_file_with_optional_query_params(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file]
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/just-file-with-optional-query-params",
          body: body,
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
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file],
            content_type: "application/octet-stream"
          )
        end
        unless params[:foo].nil?
          body.add(
            name: "foo",
            value: params[:foo]
          )
        end
        unless params[:bar].nil?
          body.add(
            name: "bar",
            value: JSON.generate(Seed::Service::Types::MyObject.new(params[:bar]).to_h),
            content_type: "application/json"
          )
        end
        unless params[:foo_bar].nil?
          body.add(
            name: "foo_bar",
            value: JSON.generate(params[:foo_bar]),
            content_type: "application/json"
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/with-content-type",
          body: body,
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
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file],
            content_type: "application/octet-stream"
          )
        end
        unless params[:foo].nil?
          body.add(
            name: "foo",
            value: params[:foo]
          )
        end
        unless params[:bar].nil?
          body.add(
            name: "bar",
            value: params[:bar]
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/with-form-encoding",
          body: body,
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
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        unless params[:maybe_string].nil?
          body.add(
            name: "maybe_string",
            value: params[:maybe_string]
          )
        end
        unless params[:integer].nil?
          body.add(
            name: "integer",
            value: params[:integer]
          )
        end
        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file]
          )
        end
        params[:file_list]&.each do |file|
          body.add_file(
            name: "file_list",
            file: file
          )
        end
        if params[:maybe_file]
          body.add_file(
            name: "maybe_file",
            file: params[:maybe_file]
          )
        end
        params[:maybe_file_list]&.each do |file|
          body.add_file(
            name: "maybe_file_list",
            file: file
          )
        end
        unless params[:maybe_integer].nil?
          body.add(
            name: "maybe_integer",
            value: params[:maybe_integer]
          )
        end
        unless params[:optional_list_of_strings].nil?
          body.add(
            name: "optional_list_of_strings",
            value: params[:optional_list_of_strings]
          )
        end
        unless params[:list_of_objects].nil?
          body.add(
            name: "list_of_objects",
            value: params[:list_of_objects]
          )
        end
        unless params[:optional_metadata].nil?
          body.add(
            name: "optional_metadata",
            value: params[:optional_metadata]
          )
        end
        unless params[:optional_object_type].nil?
          body.add(
            name: "optional_object_type",
            value: params[:optional_object_type]
          )
        end
        unless params[:optional_id].nil?
          body.add(
            name: "optional_id",
            value: params[:optional_id]
          )
        end
        unless params[:list_of_objects_with_optionals].nil?
          body.add(
            name: "list_of_objects_with_optionals",
            value: params[:list_of_objects_with_optionals]
          )
        end
        unless params[:alias_object].nil?
          body.add(
            name: "alias_object",
            value: params[:alias_object]
          )
        end
        unless params[:list_of_alias_object].nil?
          body.add(
            name: "list_of_alias_object",
            value: params[:list_of_alias_object]
          )
        end
        unless params[:alias_list_of_object].nil?
          body.add(
            name: "alias_list_of_object",
            value: params[:alias_list_of_object]
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "",
          body: body,
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

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.service.optional_args
      #
      # @return [String]
      def optional_args(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:image_file]
          body.add_file(
            name: "image_file",
            file: params[:image_file],
            content_type: "image/jpeg"
          )
        end
        unless params[:request].nil?
          body.add(
            name: "request",
            value: JSON.generate(params[:request]),
            content_type: "application/json; charset=utf-8"
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/optional-args",
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
          JSON.parse(response.body, symbolize_names: true)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
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
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file]
          )
        end
        unless params[:request].nil?
          body.add(
            name: "request",
            value: params[:request]
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/inline-type",
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
          JSON.parse(response.body, symbolize_names: true)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
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
      def with_json_property(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file]
          )
        end
        unless params[:json].nil?
          body.add(
            name: "json",
            value: params[:json]
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/with-json-property",
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
          JSON.parse(response.body, symbolize_names: true)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.service.with_ref_body
      #
      # @return [String]
      def with_ref_body(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:image_file]
          body.add_file(
            name: "image_file",
            file: params[:image_file],
            content_type: "image/jpeg"
          )
        end
        unless params[:request].nil?
          body.add(
            name: "request",
            value: JSON.generate(Seed::Service::Types::MyObject.new(params[:request]).to_h),
            content_type: "application/json; charset=utf-8"
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/with-ref-body",
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
          JSON.parse(response.body, symbolize_names: true)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param _params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.service.simple
      #
      # @return [untyped]
      def simple(request_options: {}, **_params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/snippet",
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

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def with_literal_and_enum_types(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add_file(
            name: "file",
            file: params[:file]
          )
        end
        unless params[:model_type].nil?
          body.add(
            name: "model_type",
            value: params[:model_type]
          )
        end
        unless params[:open_enum].nil?
          body.add(
            name: "open_enum",
            value: params[:open_enum]
          )
        end
        unless params[:maybe_name].nil?
          body.add(
            name: "maybe_name",
            value: params[:maybe_name]
          )
        end

        request = Seed::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/with-literal-enum",
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
          JSON.parse(response.body, symbolize_names: true)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
