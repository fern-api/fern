# frozen_string_literal: true

module Seed
  module Union
    module Types
      class Request < Internal::Types::Model
        field :union, -> { Seed::Union::Types::MetadataUnion }, optional: true, nullable: false
      end
    end
  end
end
