# frozen_string_literal: true

module Seed
  module Types
    class ContainerValue < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::ContainerValueList }, key: "LIST"
      member -> { Seed::Types::ContainerValueOptional }, key: "OPTIONAL"
    end
  end
end
