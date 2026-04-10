# frozen_string_literal: true

module Seed
  module Union
    module Types
      class UnionGetRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
