# frozen_string_literal: true

module Seed
  module Identifiers
    module Types
      class IdentifierMetadataPatch < Internal::Types::Model
        field :id_type_path_param, -> { String }, optional: false, nullable: false

        field :id_type, -> { String }, optional: true, nullable: false, api_name: "idType"

        field :label, -> { String }, optional: true, nullable: false
      end
    end
  end
end
