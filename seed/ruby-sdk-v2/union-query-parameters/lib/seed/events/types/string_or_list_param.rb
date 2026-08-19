# frozen_string_literal: true

module Seed
  module Events
    module Types
      # Either a single string or a list of strings.
      class StringOrListParam < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { String }

        member -> { Internal::Types::Array[String] }
      end
    end
  end
end
