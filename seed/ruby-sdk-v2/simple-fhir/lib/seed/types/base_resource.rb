# frozen_string_literal: true

module Seed
  module Types
    class BaseResource < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :related_resources, lambda {
        Internal::Types::Array[Seed::Types::ResourceList]
      }, optional: false, nullable: false
      field :memo, -> { Seed::Types::Memo }, optional: false, nullable: false
    end
  end
end
