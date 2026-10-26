# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Union
    module Types
      class Request < Internal::Types::Model
        field :union, -> { Seed::Union::Types::MetadataUnion }, optional: true, nullable: false
      end
    end
  end
end
