# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    # Text element with a required attribute.
    class Redirect < Internal::Types::Model
      field :url, -> { String }, optional: false, nullable: false

      field :method_, -> { String }, optional: false, nullable: false, api_name: "method"

      field :kind, -> { String }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "Redirect"
      xml_text :url, String, optional: false
      xml_attribute :method_, "method", String, optional: false
      xml_attribute :kind, "kind", Internal::Xml::Literal.new("redirect")

      # The text content of this element (same as `url`).
      #
      # @return [String, nil]
      def text
        @data[:url]
      end

      # Sets the text content of this element (same as `url=`).
      def text=(value)
        self.url = value
      end
    end
  end
end
