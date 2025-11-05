# Use 3.9 because some of our internal SDKs are on extremely old generator
# versions that don't support 3.8
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
pyenv shell 3.9
pip install uv==0.8.23
