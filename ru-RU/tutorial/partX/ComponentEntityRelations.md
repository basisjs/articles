# Связь данных и компонент

Самый верный способ ваш компонент данными это создать соответвующую сущность (Entity).
Например чтобы заполнить некий список статей данными можно сделать следующее

```js
var entity = basis.require('basis.entity');

// ...

var Article = entity.createType('Article', {
    id: entity.IntId, // а зачем именно entity а не просто Number?
    title: String,
    content: String
});
```

Обратите внимание на entity.IntId. Тут мы создаем ключ в нашей сущности которая в дальнейшем будем использоваться для итерирования по
данным. Теперь нужно сгенерировать немного данных. Сделать это можно следующим способом:

```js
for (var i = 1; i <= 8; i++) {
    Article({
        id: i,
        title: 'title #' + i,
        content: 'content #' + i
    });
}
```

Все данные лежащие в Article можно получить через свойство `all`:

```js
console.log(Article.all)
```

И теперь чтобы создать список нам просто нужно положить все статьи в свойство `dataSource`:

```js
var myList = new UINode({
    template: '<div id="ArticleList"/>',

    dataSource: Article.all, // data binding to node
    childClass: ArticleNodeClassPasteHere,
    sorting: 'data.title', // set sorting

    selection: {
        handler: {
            itemsChanged: function(){
              myForm.setDelegate(this.pick());
            }
        }
    }
});
```


-------------
Article.all.setAndDestroyRemoved - WTF??? why? live_edit.html
