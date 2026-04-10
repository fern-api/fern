# frozen_string_literal: true

module Seed
  module Types
    class ContainerValueList < Internal::Types::Model
      field :value, -> { Internal::Types::Array[Seed::Types::FieldValue] }, optional: true, nullable: false
    end
  end
end
