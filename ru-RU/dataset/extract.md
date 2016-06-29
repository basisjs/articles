# Extract

`Extract` позволяет рекурсивно извлекать/разворачивать элементы из вложенных наборов, превращая их в плоскую структуру.

Правило извлечения задается при создании через свойство `rule`, меняется методом `setRule`.
При помощи правила можно трансформировать значение в новый набор данных ("развернуть" значение) или указать `basis.getter`.
Если правило возвращает `basis.data.ReadOnlyDataset` (или потомков), то в результат добавляются все его элементы, при этом к каждому новому элементу (если он еще не встречался ранее) вновь применяется `rule`.
Изменения в таком наборе отслеживаются автоматически.

```js
var Dataset = basis.require('basis.data').Dataset;
var Filter = basis.require('basis.data.dataset').Filter;
var Extract = basis.require('basis.data.dataset').Extract;
var wrap = basis.require('basis.data').wrap;
var adminUsers = new Dataset({ items: wrap([{ name: 'Admin User 1' }, { name: 'Admin User 2' }], true) })
var contentUsers = new Dataset({ items: wrap([{ name: 'Content User 1' }, { name: 'Content User 2' }], true) })

var groups = new Dataset({
  items: wrap([
    { id: 'admin', users: adminUsers },
    { id: 'content', users: contentUsers },
  ], true)
});

var extract = new Filter({
  source: new Extract({
    source: groups,
    rule: 'data.users'
  }),
  rule: 'data.name'
});

console.log(extract.getValues('data.name'));
// > ["Admin User 1", "Admin User 2", "Content User 1", "Content User 2"]

adminUsers.add(wrap([{ name: 'Admin User 3' }], true));
console.log(extract.getValues('data.name'));
// > ["Admin User 1", "Admin User 2", "Content User 1", "Content User 2", "Admin User 3"]
```

В данном случае, `Extract` используется в паре с [`Filter`](filter.md) для того, чтобы отбросить `группы` и оставить только `пользователей`.
