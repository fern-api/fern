# frozen_string_literal: true

require_relative "../../.."

module Seed
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
