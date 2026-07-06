# frozen_string_literal: true

module Seed
  module Identifiers
    module Types
      class IdentifierUpdate < Internal::Types::Model
        field :id_type_path_param, -> { String }, optional: false, nullable: false

        field :id_type, -> { String }, optional: false, nullable: false, api_name: "idType"

        field :old_value, -> { String }, optional: false, nullable: false, api_name: "oldValue"

        field :new_value, -> { String }, optional: false, nullable: false, api_name: "newValue"
      end
    end
  end
end
