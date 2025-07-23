# frozen_string_literal: true

module Endpoints
    module Types
        class PutResponse < Internal::Types::Model
            field :errors, Array, optional: true, nullable: true
        end
    end
end
