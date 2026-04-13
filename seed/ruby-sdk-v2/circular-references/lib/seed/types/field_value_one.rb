# frozen_string_literal: true

module Seed
  module Types
    class FieldValueOne < Internal::Types::Model
      field :type, -> { Seed::Types::FieldValueOneType }, optional: false, nullable: false
    end
  end
end
