# frozen_string_literal: true

module Seed
    module Types
        class Request < Internal::Types::Model
            field :union, Seed::Union::MetadataUnion, optional: true, nullable: false
        end
    end
end
