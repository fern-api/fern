# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDuplicateTypesOne < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithDuplicateTypesOneType }, optional: false, nullable: false
    end
  end
end
