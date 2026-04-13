# frozen_string_literal: true

module Seed
  module Package
    module Types
      class PackageTestRequest < Internal::Types::Model
        field :for_, -> { String }, optional: false, nullable: false, api_name: "for"
      end
    end
  end
end
