# frozen_string_literal: true

module FernExhaustive
  module Types
    module Object_
      module Types
        class ObjectWithRequiredField < Internal::Types::Model
          field :string, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
