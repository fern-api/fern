# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwelve < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwelveType }, optional: false, nullable: false
    end
  end
end
