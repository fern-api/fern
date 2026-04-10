# frozen_string_literal: true

module Seed
  module Types
    class FieldValue < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::FieldValueZero }
      member -> { Seed::Types::FieldValueOne }
      member -> { Seed::Types::FieldValueTwo }
    end
  end
end
