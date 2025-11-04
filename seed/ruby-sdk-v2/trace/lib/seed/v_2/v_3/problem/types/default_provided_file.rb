# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class DefaultProvidedFile < Internal::Types::Model
            field :file, -> { Seed::V2::V3::Problem::Types::FileInfoV2 }, optional: false, nullable: false
            field :related_types, lambda {
              Internal::Types::Array[Seed::Commons::Types::VariableType]
            }, optional: false, nullable: false, api_name: "relatedTypes"
          end
        end
      end
    end
  end
end
