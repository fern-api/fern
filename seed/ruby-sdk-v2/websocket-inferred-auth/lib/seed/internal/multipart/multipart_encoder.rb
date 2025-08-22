# frozen_string_literal: true

module Seed
  module Internal
    module Multipart
      # Encodes parameters into a `multipart/form-data` payload as described by RFC
      # 2388:
      #
      #     https://tools.ietf.org/html/rfc2388
      #
      # This is most useful for transferring file-like objects.
      #
      # Parameters should be added with `#encode`. When ready, use `#body` to get
      # the encoded result and `#content_type` to get the value that should be
      # placed in the `Content-Type` header of a subsequent request (which includes
      # a boundary value).
      #
      # This abstraction is heavily inspired by Stripe's multipart/form-data implementation,
      # which can be found here:
      #
      #     https://github.com/stripe/stripe-ruby/blob/ca00b676f04ac421cf5cb5ff0325f243651677b6/lib/stripe/multipart_encoder.rb#L18
      #
      # @api private
      class Encoder
        CONTENT_TYPE = "multipart/form-data"
        CRLF = "\r\n"

        attr_reader :boundary, :body

        def initialize
          # Chose the same number of random bytes that Go uses in its standard
          # library implementation. Easily enough entropy to ensure that it won't
          # be present in a file we're sending.
          @boundary = SecureRandom.hex(30)

          @body = String.new
          @closed = false
          @first_field = true
        end

        # Gets the content type string including the boundary.
        #
        # @return [String] The content type with boundary
        def content_type
          "#{CONTENT_TYPE}; boundary=#{@boundary}"
        end

        # Encode the given FormData object into a multipart/form-data payload.
        #
        # @param form_data [FormData] The form data to encode
        # @return [String] The encoded body.
        def encode(form_data)
          return "" if form_data.parts.empty?

          form_data.parts.each do |part|
            write_part(part)
          end
          close

          @body
        end

        # Writes a FormDataPart to the encoder.
        #
        # @param part [FormDataPart] The part to write
        # @return [nil]
        def write_part(part)
          raise "Cannot write to closed encoder" if @closed

          write_field(
            name: part.name,
            data: part.contents,
            filename: part.filename,
            headers: part.headers
          )

          nil
        end

        # Writes a field to the encoder.
        #
        # @param name [String] The field name
        # @param data [String] The field data
        # @param filename [String, nil] Optional filename
        # @param headers [Hash<String, String>, nil] Optional additional headers
        # @return [nil]
        def write_field(name:, data:, filename: nil, headers: nil)
          raise "Cannot write to closed encoder" if @closed

          if @first_field
            @first_field = false
          else
            @body << CRLF
          end

          @body << "--#{@boundary}#{CRLF}"
          @body << %(Content-Disposition: form-data; name="#{escape(name.to_s)}")
          @body << %(; filename="#{escape(filename)}") if filename
          @body << CRLF

          if headers
            headers.each do |key, value|
              @body << "#{key}: #{value}#{CRLF}"
            end
          elsif filename
            # Default content type for files.
            @body << "Content-Type: application/octet-stream#{CRLF}"
          end

          @body << CRLF
          @body << data.to_s

          nil
        end

        # Finalizes the encoder by writing the final boundary.
        #
        # @return [nil]
        def close
          raise "Encoder already closed" if @closed

          @body << CRLF
          @body << "--#{@boundary}--"
          @closed = true

          nil
        end

        private

        # Escapes quotes for use in header values and replaces line breaks with spaces.
        #
        # @param str [String] The string to escape
        # @return [String] The escaped string
        def escape(str)
          str.to_s.gsub('"', "%22").tr("\n", " ").tr("\r", " ")
        end
      end
    end
  end
end
