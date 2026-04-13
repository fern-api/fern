# frozen_string_literal: true

module Seed
  module Types
    class ResourceZero < Internal::Types::Model
      field :resource_type, -> { Seed::Types::ResourceZeroResourceType }, optional: false, nullable: false
    end
  end
end
