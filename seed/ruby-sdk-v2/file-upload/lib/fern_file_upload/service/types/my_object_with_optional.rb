# frozen_string_literal: true

module FernFileUpload
  module Service
    module Types
      class MyObjectWithOptional < Internal::Types::Model
        field :prop, -> { String }, optional: false, nullable: false
        field :optional_prop, -> { String }, optional: true, nullable: false, api_name: "optionalProp"
      end
    end
  end
end
