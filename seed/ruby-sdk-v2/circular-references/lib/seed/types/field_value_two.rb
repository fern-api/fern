# frozen_string_literal: true

module Seed
  module Types
    class FieldValueTwo < Internal::Types::Model
      field :type, -> { Seed::Types::FieldValueTwoType }, optional: false, nullable: false
      field :value, -> { Seed::Types::ContainerValue }, optional: true, nullable: false
    end
  end
end
