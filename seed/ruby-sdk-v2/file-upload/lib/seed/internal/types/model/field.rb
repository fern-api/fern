# frozen_string_literal: true
<<<<<<< HEAD

=======
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
module Seed
  module Internal
    module Types
      class Model
        # Definition of a field on a model
        class Field
          attr_reader :name, :type, :optional, :nullable, :api_name, :value, :default

          def initialize(name:, type:, optional: false, nullable: false, api_name: nil, value: nil, default: nil)
            @name = name.to_sym
            @type = type
            @optional = optional
            @nullable = nullable
            @api_name = (api_name || name).to_sym
            @value = value
            @default = default
          end

          def literal?
            !value.nil?
          end
        end
      end
    end
  end
end
