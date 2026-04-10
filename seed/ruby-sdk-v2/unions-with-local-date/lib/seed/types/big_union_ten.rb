# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTen < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTenType }, optional: false, nullable: false
    end
  end
end
