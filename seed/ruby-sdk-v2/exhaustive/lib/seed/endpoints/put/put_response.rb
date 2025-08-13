# frozen_string_literal: true

module Seed
    module Types
        class PutResponse < Internal::Types::Model
            field :errors, Internal::Types::Array[Seed::Endpoints::Put::Error], optional: true, nullable: false

    end
end
