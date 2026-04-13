# frozen_string_literal: true

module Seed
  module Types
    class UnionWithMultipleNoPropertiesTwo < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithMultipleNoPropertiesTwoType }, optional: false, nullable: false
    end
  end
end
