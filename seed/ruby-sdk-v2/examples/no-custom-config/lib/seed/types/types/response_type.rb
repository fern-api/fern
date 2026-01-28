# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class ResponseType < Internal::Types::Model
        field :type, -> { FernExamples::Types::Type }, optional: false, nullable: false
      end
    end
  end
end
