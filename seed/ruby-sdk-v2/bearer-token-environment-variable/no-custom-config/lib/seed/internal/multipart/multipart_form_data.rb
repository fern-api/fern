# frozen_string_literal: true

module Seed
  module Internal
    module Multipart
      # @api private
      class FormData
        # @return [Array<FormDataPart>] The parts in this multipart form data.
        attr_reader :parts

        # @return [Encoder] The encoder for this multipart form data.
        private attr_reader :encoder

        def initialize
          @encoder = Encoder.new
          @parts = []
        end

        # Adds a new part to the multipart form data.
        #
        # @param name [String] The name of the form field
        # @param value [String, Integer, Float, Boolean, #read] The value of the field
        # @param content_type [String, nil] Optional content type
        # @return [self] Returns self for chaining
        def add(name:, value:, content_type: nil)
          headers = content_type ? { "Content-Type" => content_type } : nil
          add_part(FormDataPart.new(name:, value:, headers:))
        end

        # Adds a file to the multipart form data.
        #
        # @param name [String] The name of the form field
        # @param file [#read] The file or readable object
        # @param filename [String, nil] Optional filename (defaults to basename of path for File objects)
        # @param content_type [String, nil] Optional content type (e.g. "image/png")
        # @return [self] Returns self for chaining
        def add_file(name:, file:, filename: nil, content_type: nil)
          headers = content_type ? { "Content-Type" => content_type } : nil
          filename ||= filename_for(file)
          add_part(FormDataPart.new(name:, value: file, filename:, headers:))
        end

        # Adds a pre-created part to the multipart form data.
        #
        # @param part [FormDataPart] The part to add
        # @return [self] Returns self for chaining
        def add_part(part)
          @parts << part
          self
        end

        # Gets the content type string including the boundary.
        #
        # @return [String] The content type with boundary.
        def content_type
          @encoder.content_type
        end

        # Encode the multipart form data into a multipart/form-data payload.
        #
        # @return [String] The encoded body.
        def encode
          @encoder.encode(self)
        end

        private

        def filename_for(file)
          if file.is_a?(::File) || file.respond_to?(:path)
            ::File.basename(file.path)
          elsif file.respond_to?(:name)
            file.name
          end
        end
      end
    end
  end
end
