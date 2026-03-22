# Rsbuild project

## Setup

Install the dependencies:

```bash
npm install
```

## Get started

Start the dev server, and the app will be available at [http://localhost:3000](http://localhost:3000).

```bash
npm run dev
```

Build the app for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Learn more

To learn more about Rsbuild, check out the following resources:

- [Rsbuild documentation](https://rsbuild.rs) - explore Rsbuild features and APIs.
- [Rsbuild GitHub repository](https://github.com/web-infra-dev/rsbuild) - your feedback and contributions are welcome!


## ToDo

- Расширение корневого элемента если не задан rows по высоте
- [x] изменение размера отслеживается и применяется даже при уводе курсора вне родителя
- алгоритм распределения карточке на гриде, при пересечении (с поддержкой смены порядка в линии)
- стартовое распределение без указания положения на лайоуте, N элементов на строку
- сокрытие уголков согласно параметрам в структуре лайоута
- хендл (область) для перетаскивания карточки
- идея как делать подпись/заголовок группы