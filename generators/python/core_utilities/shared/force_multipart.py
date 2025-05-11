class ForceMultipartDict(dict):
    """
    A dictionary subclass that always evaluates to True in boolean contexts.
    
    This is used to force multipart/form-data encoding in HTTP requests even when
    the dictionary is empty, which would normally evaluate to False.
    """
    def __bool__(self):
        return True


FORCE_MULTIPART = ForceMultipartDict() 