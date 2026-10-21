# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class Hangup < Internal::Types::Model
      include Seed::Internal::Xml::Serializable

      xml_element "Hangup"
    end
  end
end
