# frozen_string_literal: true

module Seed
  module Types
    class ResourceOne < Internal::Types::Model
      field :resource_type, -> { Seed::Types::ResourceOneResourceType }, optional: false, nullable: false
    end
  end
end
