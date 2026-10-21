# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"

require_relative "seed/internal/json/serializable"
require_relative "seed/internal/types/type"
require_relative "seed/internal/types/utils"
require_relative "seed/internal/types/union"
require_relative "seed/internal/errors/constraint_error"
require_relative "seed/internal/errors/type_error"
require_relative "seed/internal/http/base_request"
require_relative "seed/internal/json/request"
require_relative "seed/internal/http/raw_client"
require_relative "seed/internal/multipart/multipart_encoder"
require_relative "seed/internal/multipart/multipart_form_data_part"
require_relative "seed/internal/multipart/multipart_form_data"
require_relative "seed/internal/multipart/multipart_request"
require_relative "seed/internal/types/model/field"
require_relative "seed/internal/types/model"
require_relative "seed/internal/types/array"
require_relative "seed/internal/types/boolean"
require_relative "seed/internal/types/enum"
require_relative "seed/internal/types/hash"
require_relative "seed/internal/types/unknown"
require_relative "seed/errors/api_error"
require_relative "seed/errors/response_error"
require_relative "seed/errors/client_error"
require_relative "seed/errors/redirect_error"
require_relative "seed/errors/server_error"
require_relative "seed/errors/timeout_error"
require_relative "seed/internal/iterators/item_iterator"
require_relative "seed/internal/iterators/cursor_item_iterator"
require_relative "seed/internal/iterators/offset_item_iterator"
require_relative "seed/internal/iterators/cursor_page_iterator"
require_relative "seed/internal/iterators/offset_page_iterator"
require_relative "seed/errors/connection_error"
require_relative "seed/client"

module Seed
  module Types
    autoload :RootType, ::File.join(__dir__, "seed/types/root_type")
    autoload :ImportingA, ::File.join(__dir__, "seed/types/importing_a")
  end
end

module Seed
  module A
    module Types
      autoload :A, ::File.join(__dir__, "seed/a/types/a")
    end
  end
end

module Seed
  module Ast
    module Types
      autoload :Berry, ::File.join(__dir__, "seed/ast/types/berry")
      autoload :Fig, ::File.join(__dir__, "seed/ast/types/fig")
      autoload :Acai, ::File.join(__dir__, "seed/ast/types/acai")
      autoload :Dog, ::File.join(__dir__, "seed/ast/types/dog")
      autoload :Cat, ::File.join(__dir__, "seed/ast/types/cat")
      autoload :Fruit, ::File.join(__dir__, "seed/ast/types/fruit")
      autoload :Animal, ::File.join(__dir__, "seed/ast/types/animal")
      autoload :LeafNode, ::File.join(__dir__, "seed/ast/types/leaf_node")
      autoload :BranchNode, ::File.join(__dir__, "seed/ast/types/branch_node")
      autoload :Node, ::File.join(__dir__, "seed/ast/types/node")
      autoload :NodesWrapper, ::File.join(__dir__, "seed/ast/types/nodes_wrapper")
      autoload :PrimitiveValue, ::File.join(__dir__, "seed/ast/types/primitive_value")
      autoload :ObjectValue, ::File.join(__dir__, "seed/ast/types/object_value")
      autoload :FieldValue, ::File.join(__dir__, "seed/ast/types/field_value")
      autoload :ContainerValue, ::File.join(__dir__, "seed/ast/types/container_value")
      autoload :FieldName, ::File.join(__dir__, "seed/ast/types/field_name")
      autoload :ObjectFieldValue, ::File.join(__dir__, "seed/ast/types/object_field_value")
    end
  end
end
