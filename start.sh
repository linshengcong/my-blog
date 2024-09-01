target_version="v14.21.3"

current_version=$(node -v)

echo "目前系统node 版本是$current_version, 需要依赖的node 版本$target_version"

if [ ${current_version} != ${target_version} ]; then
  nvm use '14.21.3'
fi

npx vuepress dev docs
