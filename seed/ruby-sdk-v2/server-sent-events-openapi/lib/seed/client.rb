# frozen_string_literal: true

module Seed
  class Client
    # Uses discriminator with mapping, x-fern-discriminator-context set to protocol. Because the discriminant is at the
    # protocol level, the data field can be any type or absent entirely. Demonstrates heartbeat (no data), string
    # literal, number literal, and object data payloads.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_protocol_no_collision(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/protocol-no-collision",
        body: Seed::Types::StreamRequest.new(params).to_h,
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

    # Same as endpoint 1, but the object data payload contains its own "event" property, which collides with the SSE
    # envelope's "event" discriminator field. Tests whether generators correctly separate the protocol-level
    # discriminant from the data-level field when context=protocol is specified.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_protocol_collision(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/protocol-collision",
        body: Seed::Types::StreamRequest.new(params).to_h,
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

    # x-fern-discriminator-context is explicitly set to "data" (the default value). Each variant uses allOf to extend a
    # payload schema and adds the "event" discriminant property at the same level. There is no "data" wrapper. The
    # discriminant and payload fields coexist in a single flat object. This matches the real-world pattern used by
    # customers with context=data.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_data_context(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/data-context",
        body: Seed::Types::StreamRequest.new(params).to_h,
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

    # The x-fern-discriminator-context extension is omitted entirely. Tests whether Fern correctly infers the default
    # behavior (context=data) when the extension is absent. Same flat allOf pattern as endpoint 3.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_no_context(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/no-context",
        body: Seed::Types::StreamRequest.new(params).to_h,
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

    # Mismatched combination: context=protocol with the flat allOf schema pattern that is normally used with
    # context=data. Shows what happens when the discriminant is declared as protocol-level but the schema uses allOf to
    # flatten the event field alongside payload fields instead of wrapping them in a data field.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_protocol_with_flat_schema(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/protocol-with-flat-schema",
        body: Seed::Types::StreamRequest.new(params).to_h,
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

    # Mismatched combination: context=data with the envelope+data schema pattern that is normally used with
    # context=protocol. Shows what happens when the discriminant is declared as data-level but the schema separates the
    # event field and data field into an envelope structure.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_data_context_with_envelope_schema(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/data-context-with-envelope-schema",
        body: Seed::Types::StreamRequest.new(params).to_h,
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

    # Follows the pattern from the OAS 3.2 specification's own SSE example. The itemSchema extends a base Event schema
    # via $ref and uses inline oneOf variants with const on the event field to distinguish event types. Data fields use
    # contentSchema/contentMediaType for structured payloads. No discriminator object is used. Event type resolution
    # relies on const matching.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_oas_spec_native(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/oas-spec-native",
        body: Seed::Types::StreamRequest.new(params).to_h,
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

    # Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on
    # a request body field. The request body is a $ref to a named schema. The response and response-stream point to
    # different schemas.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamXFernStreamingConditionStreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_x_fern_streaming_condition_stream(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/x-fern-streaming-condition",
        body: Seed::Types::StreamXFernStreamingConditionStreamRequest.new(params).to_h,
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

    # Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on
    # a request body field. The request body is a $ref to a named schema. The response and response-stream point to
    # different schemas.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamXFernStreamingConditionRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [Seed::Types::CompletionFullResponse]
    def stream_x_fern_streaming_condition(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/x-fern-streaming-condition",
        body: Seed::Types::StreamXFernStreamingConditionRequest.new(params).to_h,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::CompletionFullResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by
    # a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not
    # excluded from the context during streaming processing.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamXFernStreamingSharedSchemaStreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_x_fern_streaming_shared_schema_stream(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/x-fern-streaming-shared-schema",
        body: Seed::Types::StreamXFernStreamingSharedSchemaStreamRequest.new(params).to_h,
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

    # Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by
    # a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not
    # excluded from the context during streaming processing.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamXFernStreamingSharedSchemaRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [Seed::Types::CompletionFullResponse]
    def stream_x_fern_streaming_shared_schema(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/x-fern-streaming-shared-schema",
        body: Seed::Types::StreamXFernStreamingSharedSchemaRequest.new(params).to_h,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::CompletionFullResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # A non-streaming endpoint that references the same SharedCompletionRequest schema as endpoint 10. Ensures the
    # shared $ref schema remains available and is not excluded during the streaming endpoint's processing.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::SharedCompletionRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [Seed::Types::CompletionFullResponse]
    def validate_completion(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "validate-completion",
        body: Seed::Types::SharedCompletionRequest.new(params).to_h,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::CompletionFullResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants
    # inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream
    # condition property is not duplicated in the generated output when the base schema is expanded into each variant.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamXFernStreamingUnionStreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_x_fern_streaming_union_stream(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/x-fern-streaming-union",
        body: Seed::Types::StreamXFernStreamingUnionStreamRequest.new(params).to_h,
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

    # Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants
    # inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream
    # condition property is not duplicated in the generated output when the base schema is expanded into each variant.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamXFernStreamingUnionRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [Seed::Types::CompletionFullResponse]
    def stream_x_fern_streaming_union(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/x-fern-streaming-union",
        body: Seed::Types::StreamXFernStreamingUnionRequest.new(params).to_h,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::CompletionFullResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # References UnionStreamRequestBase directly, ensuring the base schema cannot be excluded from the context. This
    # endpoint exists to verify that shared base schemas used in discriminated union variants with stream-condition
    # remain available.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::UnionStreamRequestBase]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [Seed::Types::ValidateUnionRequestResponse]
    def validate_union_request(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "validate-union-request",
        body: Seed::Types::UnionStreamRequestBase.new(params).to_h,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::ValidateUnionRequestResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS
    # 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal,
    # producing stream?: true | null instead of stream: true. The const/type override must be spread after the original
    # property.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamXFernStreamingNullableConditionStreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_x_fern_streaming_nullable_condition_stream(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/x-fern-streaming-nullable-condition",
        body: Seed::Types::StreamXFernStreamingNullableConditionStreamRequest.new(params).to_h,
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

    # Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS
    # 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal,
    # producing stream?: true | null instead of stream: true. The const/type override must be spread after the original
    # property.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamXFernStreamingNullableConditionRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [Seed::Types::CompletionFullResponse]
    def stream_x_fern_streaming_nullable_condition(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/x-fern-streaming-nullable-condition",
        body: Seed::Types::StreamXFernStreamingNullableConditionRequest.new(params).to_h,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::CompletionFullResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # Uses x-fern-streaming with format: sse but no stream-condition. This represents a stream-only endpoint that always
    # returns SSE. There is no non-streaming variant, and the response is always a stream of chunks.
    #
    # @param request_options [Hash]
    # @param params [Seed::Types::StreamRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @return [untyped]
    def stream_x_fern_streaming_sse_only(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "POST",
        path: "stream/x-fern-streaming-sse-only",
        body: Seed::Types::StreamRequest.new(params).to_h,
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
          "User-Agent" => "fern_server-sent-events-openapi/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end
  end
end
