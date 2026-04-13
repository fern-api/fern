# frozen_string_literal: true

module Seed
  module Types
    class UnionWithSubTypesOne < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithSubTypesOneType }, optional: false, nullable: false
    end
  end
end
