# frozen_string_literal: true

require "securerandom"

module Seed
  module Internal
    module Multipart
      # @api private
      class FormDataPart
        attr_reader :name, :contents, :filename, :headers

        # @param name [String] The name of the form field
        # @param value [String, Integer, Float, Boolean, File, #read] The value of the field
        # @param filename [String, nil] Optional filename for file uploads
        # @param headers [Hash<String, String>, nil] Optional additional headers
        def initialize(name:, value:, filename: nil, headers: nil)
          @name = name
          @contents = convert_to_content(value)
          @filename = filename
          @headers = headers
        end

        # Converts the part to a hash suitable for serialization.
        #
        # @return [Hash] A hash representation of the part
        def to_hash
          result = {
            name: @name,
            contents: @contents
          }
          result[:filename] = @filename if @filename
          result[:headers] = @headers if @headers
          result
        end

        private

        # Converts various types of values to a content representation
        # @param value [String, Integer, Float, Boolean, #read] The value to convert
        # @return [String] The string representation of the value
        def convert_to_content(value)
          if value.respond_to?(:read)
            value.read
          else
            value.to_s
          end
        end
      end
    end
  end
end
