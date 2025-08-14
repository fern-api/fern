# frozen_string_literal: true

module Seed
    module Types
        class BaseResource < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :related_resources, Internal::Types::Array[Seed::ResourceList], optional: false, nullable: false
            field :memo, Seed::Memo, optional: false, nullable: false

    end
end
