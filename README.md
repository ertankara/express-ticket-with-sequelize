# DEPRECATED! DOCS WILL BE UPDATED SOON

## Express train to the response

Skip writing code for CRUD operations while using `sequelize` or
`sequelize-typescript`

## Abbreviations

- `req.body` refers to Request objects `body` property
  that is passed to the middlewares
- `req.params` refers to Request objects `params`
  property that is passed to the middlewares
- `req.query` refers to Request objects `query`
  property that is passed to the middlewares

## Design

**Before using this package**

Make sure you follow semantic structure of a RESTful API

e.g

PUT `/api/users/:userId`

This combination of path and method indicates an update action
of a user that is identified with value in the `:userId` path
variable

another example

POST `/api/users`

The path and method above indicates new creation of user
it relies on `req.body` to provide user values

Function dependencies for each function are explained
in detail below

## `createRecord()`

Creates a record using the passed model in the target table,
relies on `req.body` also able to accept parameters from
the `req.params` by passing and options object with
`requestParams` property.

```js
// Fetches `:userId` from path variables and passes to
// sequelize `create` method as `id`
// if `passAs` field is not provided then paramName will be passed
// directly
createRecord(User, {
  requestParams: [{ paramName: "userId", passAs: "id" }]
});

// Fetches /some/path/:userId value
// Passing it to the User.create({ ...req.body, id: userId })
```

if no requestParams are provided then this function will only
rely on the `req.body`

### Signature

```ts
createRecord = <M extends TSSequelizeModel, K extends SequelizeModel>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    requestParams = []
  }: { requestParams?: { paramName: string; passAs?: string }[] } = {}
)
```

### Depends On

- `req.body` pass the req.uired fields via body of the
  response
- `req.params` can be used as well

### Passes

- `res.locals[LOCAL_AFFECTED_RECORDS]`
  - `newRecord: Record<string, any>;`

## `getPaginatedResults()`

Tries to paginate the records if params provided
else does nothing

## Signature

```ts
getPaginatedResults = <
  M extends TSSequelizeModel,
  K extends SequelizeModel
>(
  model: // Model instance to pass
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
1  {
    // defaults to pageSize & pageNumber
    // custom names can be passed
    // if one of them customized both needs to be provided
    /*
      e.g
      [
        {
          pageSizeVariableName: "pageSize",
          pageNumberVariableName: "currentPage"
        }
      ]

    */
    paginationParams = null,
    where = {}
  }: {
    paginationParams?: PaginationParams | null;
    where?: Record<string, any>; // plain old sequelize 'where'
  }
)
```

### Depends On

- `req.query` page size and page number values are
  obtained from the query object, if custom names
  are passed it'll try to find them too
  **it won't look for them in the req.body ever**

### Passes

- `res.locals[LOCAL_PAGINATED]`
  - `Record<string, any>[]`

## `updateRecord()`

See [notice](#notice) first, isn't safe on its own

### Signature

```ts
// Updates the record, relies on `req.params` and
// `req.body`

updateRecord = <M extends TSSequelizeModel, K extends SequelizeModel>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    // Obtains `req.params` keys here so it can extract them from path
    identifier,
    // Should updated record be available in the next middleware
    returning = false,
    // conditions
    where = {}
  }: {
    identifier: IdentifierKeys;
    returning?: boolean;
    where?: Record<string, any>;
  }
)
```

### Depends On

- `req.body` where new fields must be provided to
  update th existing record.
- `req.params` where foreign and / or primary keys
  are passed in order to find the target record

### Passes

- `res.local[LOCAL_UPDATED]`
  - `updatedRecord: Record<string, any> | null;`
  - `affectedRowCount: number | undefined;`
  - `updatedRecordId: number | string | undefined;`

## `deleteRecord()`

See [notice](#notice) first, isn't safe on its own

DELETE `/api/users/:userId/jobs/:jobId`

This method with this url speaks the following
words

```
Hello, Imma delete job that is identied with :jobId
that belongs to user that is identified with :userId
```

```ts
deleteRecord(JobModel /* Some sequelize model that represents Jobs table */, {
  identifier: {
    // Get :jobId from `req.params`
    // As the name of the param speaks for itself
    // if no pk is passed it'll also be used as
    // primary key while performing deletion in the
    // target table
    fkIfPassedPkElsePk: "jobId",
    // While deleting uses primary key
    // which is `id`
    pk: "id"
  }
});
```

if it was like the following uri with the DELETE method

DELETE `/api/users/:userId/jobs/:id`

```ts
deleteRecord(JobModel /* Some sequelize model that represents Jobs table */, {
  identifier: {
    // Assuming that `Jobs` table has a primary key called `id`
    // in such case this key will be used for both extracting value from
    // `req.params` and also will be used for deleting record in the table
    // since they both happen to be the same field match
    fkIfPassedPkElsePk: "id"
  }
});
```

Has two modes either completely deletes the record
-- which is undoable -- or updates the status of the
record, former one is called `hard`, latter is called `soft`
**defaults to soft**

### Signature

```ts
deleteRecord = <M extends TSSequelizeModel, K extends SequelizeModel>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    identifier,
    conditionParams,
    deleteMode = "soft",
    where = {}
  }: {
    identifier: IdentifierKeys;
    conditionParams: DeleteStatusKey;
    deleteMode?: "soft" | "hard";
    where?: Record<string, any>;
  }
)
```

### Depends On

- `req.params` to obtain the foreign and / or primary
  keys

### Passes

- `res.local[LOCAL_DELETED]`
  - `deletedRecord: Record<string, any> | null;`
  - `affectedRowCount: number | undefined;`
  - `deletedRecordId: string | number | undefined;`

## Notice {#notice}

DOT! Do one thing, I am lazy and dumb
to find the way to make sure that indeed user
is deleting or updating their own records, I encourage you
to apply DOT rule so you should handle the authorization
in a seperate middleware to confirm that user can indeed
reach to this middleware
