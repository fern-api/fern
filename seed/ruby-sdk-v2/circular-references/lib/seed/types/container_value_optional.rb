# frozen_string_literal: true

module Seed
  module Types
    class ContainerValueOptional < Internal::Types::Model
      field :value, -> { Seed::Types::FieldValue }, optional: true, nullable: false
    end
  end
end
