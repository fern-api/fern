# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDuplicativeDiscriminantsOne < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithDuplicativeDiscriminantsOneType }, optional: false, nullable: true
      field :title, -> { String }, optional: false, nullable: false
    end
  end
end
